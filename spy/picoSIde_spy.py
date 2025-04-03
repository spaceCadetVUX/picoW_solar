import network
import socket
import time
import machine
from machine import Pin, I2C, PWM
import _thread
import urequests
from ssd1306 import SSD1306_I2C
import uasyncio as asyncio
import ujson



# Initialize I2C buse
i2c0 = I2C(0, scl=Pin(1), sda=Pin(0), freq=100000)  # For sensors
i2c1 = I2C(1, sda=Pin(14), scl=Pin(15), freq=400000)  # For OLED

# Initialize OLED Display
oled = SSD1306_I2C(128, 64, i2c1)

# TCA9548A I2C address
TCA9548A_ADDR = 0x70

# BH1750 I2C address
BH1750_ADDR = 0x23



# Initialize servo motors for pan (horizontal) and tilt (vertical)
servo_pan = PWM(Pin(2))  # Pan servo connected to GPIO 18
servo_tilt = PWM(Pin(3)) # Tilt servo connected to GPIO 19

# Set PWM frequency for servos
servo_pan.freq(50)  # 50Hz PWM frequency for servos
servo_tilt.freq(50)

# Define servo motor angle range and corresponding duty cycle
MIN_DUTY = 2000  # Minimum duty cycle (0 degrees)
MAX_DUTY = 8200  # Maximum duty cycle (180 degrees)

# Initialize variables for light tracking
LIGHT_VALUES = [0, 0, 0, 0]  # Stores the latest light readings from sensors
LIGHT_BUFFER = [[], [], [], []]  # Buffer to store past light readings for averaging
THRESHOLD = 10  # Minimum difference threshold for movement
ALPHA = 0.3  # Smoothing factor for light readings
data = {}
SAMPLE_SIZE = 5

global filtered_tl, filtered_tr, filtered_bl, filtered_br
filtered_tl = filtered_tr = filtered_bl = filtered_br = 0



# Define UART on Pico W
uart = machine.UART(1, baudrate=115200, tx=machine.Pin(4), rx=machine.Pin(5))

# data to send
LIGHT_VALUES_TO_SEND = [0, 0, 0, 0]
X_AXIS_TO_SEND = 0
Y_AXIS_TO_SEND = 0

# data to receive
AUTO_MODE = True
X_AXIS_TO_RECEIVE = 0
Y_AXIS_TO_RECEIVE = 0


# uart send 
def send_data():
    """Send data from Pico W to ESP8266 via UART"""
    data = {
        "light": LIGHT_VALUES_TO_SEND,
        "x": X_AXIS_TO_SEND,
        "y": Y_AXIS_TO_SEND
    }
    json_data = ujson.dumps(data) + "\n"  # Convert to JSON and add newline for delimiting
    uart.write(json_data)


# uart receive 
def receive_data():
    """Receive data from ESP8266 and update global variables"""
    global AUTO_MODE, X_AXIS_TO_RECEIVE, Y_AXIS_TO_RECEIVE
    if uart.any():  # Check if data is available
        try:
            received = uart.readline().decode().strip()
            if received:
                data = ujson.loads(received)
                AUTO_MODE = data.get("auto", AUTO_MODE)
                X_AXIS_TO_RECEIVE = data.get("x", X_AXIS_TO_RECEIVE)
                Y_AXIS_TO_RECEIVE = data.get("y", Y_AXIS_TO_RECEIVE)
        except Exception as e:
            print("UART Receive Error:", e)
            




def select_channel(channel):
    """ Selects the TCA9548A channel with error handling """
    try:
        if 0 <= channel <= 7:
            i2c0.writeto(TCA9548A_ADDR, bytearray([1 << channel]))
    except OSError:
        print(f"Error selecting TCA9548A channel {channel}. Resetting I2C...")
        i2c0.init(freq=100000)  # Reinitialize I2C



def read_bh1750():
    """ Reads light level from BH1750 sensor with error handling """
    try:
        i2c0.writeto(BH1750_ADDR, b'\x10')  # Start measurement
        time.sleep(0.03)  # Wait for measurement
        data = i2c0.readfrom(BH1750_ADDR, 2)
        lux = int.from_bytes(data, 'big') / 1.2
        return lux
    except OSError as e:
        print(f"BH1750 read error: {e}")
        return -1  # Return -1 to indicate a read failure





# servo path
# Function to set the servo motor angle
def set_servo_angle(servo, angle):
    duty = int(MIN_DUTY + (angle / 180) * (MAX_DUTY - MIN_DUTY))  # Convert angle to PWM duty cycle
    servo.duty_u16(duty)  # Apply duty cycle to servo
    
# Function to smoothly move servo between angles



def smooth_move(servo, current_angle, target_angle, steps=100):
    """Di chuyển động cơ servo mượt mà"""
    step_size = (target_angle - current_angle) / steps
    for _ in range(steps):
        current_angle += step_size
        set_servo_angle(servo, current_angle)
        time.sleep(0.015)


def get_average_light():
    """Tính giá trị trung bình của ánh sáng"""
    for ch in range(4):
        select_channel(ch)
        lux = read_bh1750()
        if len(LIGHT_BUFFER[ch]) < SAMPLE_SIZE:
            LIGHT_BUFFER[ch].append(lux)
        else:
            LIGHT_BUFFER[ch].pop(0)
            LIGHT_BUFFER[ch].append(lux)
        LIGHT_VALUES[ch] = sum(LIGHT_BUFFER[ch]) / len(LIGHT_BUFFER[ch])


# Function to determine direction based on light intensity differences



# Function to control servo movement based on light tracking
def determine_direction():
    """Xác định hướng dựa trên giá trị ánh sáng từ 4 góc"""
    global filtered_tl, filtered_tr, filtered_bl, filtered_br
    tl, tr, bl, br = LIGHT_VALUES

    filtered_tl = ALPHA * tl + (1 - ALPHA) * filtered_tl
    filtered_tr = ALPHA * tr + (1 - ALPHA) * filtered_tr
    filtered_bl = ALPHA * bl + (1 - ALPHA) * filtered_bl
    filtered_br = ALPHA * br + (1 - ALPHA) * filtered_br

    # Tính toán sự khác biệt theo hướng
    diff_horizontal = (filtered_tr - filtered_tl)
    diff_vertical = (filtered_br - filtered_tl)

    # Tăng scaling_factor để di chuyển góc rộng hơn
    scaling_factor = 0.7 # Tăng giá trị này

    pan_adjustment = diff_horizontal * scaling_factor
    tilt_adjustment = diff_vertical * scaling_factor

    # Tăng giới hạn điều chỉnh
    pan_adjustment = max(min(pan_adjustment, 30), -30)  # Tăng giới hạn từ 15 lên 30
    tilt_adjustment = max(min(tilt_adjustment, 30), -30) # Tăng giới hạn từ 15 lên 30

    # Tính toán góc mục tiêu
    target_pan = max(min(90 + pan_adjustment, 180), 0)
    target_tilt = max(min(90 + tilt_adjustment, 180), 0)

    return target_pan, target_tilt, f"Pan:{pan_adjustment:.1f} Tilt:{tilt_adjustment:.1f}"


        

        
# Function to rotate OLED screen by 180 degrees
def rotate_oled_180():
    buffer = oled.buffer[:]  # Copy OLED pixel data
    for y in range(64):
        for x in range(128):
            oled.pixel(x, y, buffer[128 * (63 - y) + (127 - x)])  # Reverse pixel positions
    oled.show()
        









def control_servos():
    """Điều khiển động cơ servo"""
    global X_AXIS_TO_SEND, Y_AXIS_TO_SEND
    current_pan, current_tilt = 90, 90
    set_servo_angle(servo_pan, current_pan)
    set_servo_angle(servo_tilt, current_tilt)
    last_adjustment_time = 0

    while True:
        get_average_light()
        target_pan, target_tilt, direction = determine_direction()

        if abs(current_pan - target_pan) > 1 or abs(current_tilt - target_tilt) > 1:
            smooth_move(servo_pan, current_pan, target_pan)
            smooth_move(servo_tilt, current_tilt, target_tilt)
            current_pan, current_tilt = target_pan, target_tilt
            last_adjustment_time = time.ticks_ms()
            
        X_AXIS_TO_SEND = current_pan
        Y_AXIS_TO_SEND = current_tilt
        
        print(current_pan)
        print(current_tilt)




        time.sleep(0.1)
        

def read_sensor():
    
    while True:
        oled.fill(0)
        for ch in range(4):  # Read from 4 channels
            select_channel(ch)
            lux = read_bh1750()
            LIGHT_VALUES[ch] = lux
            LIGHT_VALUES_TO_SEND[ch] = lux
            data[f"S{ch+1}"] = lux

            # Display readings on OLED
            oled.text(f"LS {ch+1}: {lux:.2f} Lux", 0, ch * 15)
            print(f"LS {ch+1}: {lux:.2f} Lux")
            oled.show()
            time.sleep(0.1)
            
        # send data to esp 8266    
        send_data()
    
    
# Main Function
def main():
    


    
    _thread.start_new_thread(control_servos,())
    read_sensor()
    



    

    

if __name__ == "__main__":
    main()





