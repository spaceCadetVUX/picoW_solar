import time
import machine
from machine import Pin, I2C, PWM
import _thread
import ujson
from ssd1306 import SSD1306_I2C

# Khởi tạo I2C
i2c0 = I2C(0, scl=Pin(1), sda=Pin(0), freq=100000)
i2c1 = I2C(1, sda=Pin(14), scl=Pin(15), freq=400000)
 
# Khởi tạo OLED
oled = SSD1306_I2C(128, 64, i2c1)

# Địa chỉ TCA9548A và BH1750
TCA9548A_ADDR = 0x70
BH1750_ADDR = 0x23
NUM_SENSORS = 4  # Total BH1750 sensors connected
# Khởi tạo servo
servo_pan = PWM(Pin(2))
servo_tilt = PWM(Pin(3))
servo_pan.freq(50)
servo_tilt.freq(50)

# Hằng số servo
MIN_DUTY = 2000
MAX_DUTY = 8200

# Biến toàn cục
LIGHT_VALUES = [0, 0, 0, 0]
ALPHA = 0.3
filtered_tl = filtered_tr = filtered_bl = filtered_br = 0
TARGET_PAN = 90
TARGET_TILT = 90
CURRENT_PAN = 90
CURRENT_TILT = 90


LIGHT_THRESHOLD = 5  # The max allowed deviation for sensors to be considered the same
SCAN_ANGLE_STEP = 1  # Angle step when scanning
SCAN_DELAY = 0.00001  # Delay between each scanning step
LIGHT_HISTORY = {ch: [] for ch in range(4)}  # Store past values for smoothing

# sensor checking
def select_tca_channel(channel):
    """Selects a channel on the TCA9548A multiplexer"""
    if 0 <= channel < 8:
        i2c0.writeto(TCA9548A_ADDR, bytes([1 << channel]))  # Activate the channel
        time.sleep(0.1)  # Small delay to allow switching
        
def check_bh1750():
    """Tries to communicate with BH1750 by sending a test command"""
    try:
        i2c0.writeto(BH1750_ADDR, bytes([0x10]))  # Send "Continuous H-Resolution Mode" command
        time.sleep(0.2)
        return True  # If no error occurs, the sensor is present
    except OSError:
        return False  # If communication fails, the sensor is missing

def check_i2c_devices():
    oled.fill(0)
    oled.text("Scanning I2C...", 10, 10)
    oled.show()

    # Draw loading bar animation
    for i in range(0, 120, 20):
        oled.rect(10, 30, 100, 10, 1)  # Outline of the loading bar
        oled.fill_rect(10, 30, i, 10, 1)  # Fill the loading bar
        oled.show()
        time.sleep(0.3)

    found_sensors = []

    for channel in range(NUM_SENSORS):
        select_tca_channel(channel)  # Switch to each TCA channel
        if check_bh1750():  # Check if the sensor responds
            found_sensors.append(channel)

    oled.fill(0)
    if len(found_sensors) == NUM_SENSORS:
        oled.text("I2C Check: OK", 10, 10)
        for i, ch in enumerate(found_sensors):
            oled.text(f"CH {ch}: BH1750 OK", 10, 20 + (i * 10))
        oled.show()
        time.sleep(1)
        return True
    else:
        oled.text("I2C Error!", 10, 10)
        missing_sensors = [ch for ch in range(NUM_SENSORS) if ch not in found_sensors]
        for i, ch in enumerate(missing_sensors):
            oled.text(f"CH {ch}: MISSING", 10, 20 + (i * 10))
        oled.show()
        time.sleep(5)
        return False


    
def initialize_servos():
    oled.fill(0)
    oled.text("Initializing ", 10, 10)
    oled.text("Servos...", 10, 20)
    oled.show()

    # Loading bar animation
    for i in range(0, 120, 30):
        oled.rect(10, 30, 100, 10, 1)  # Outline of the loading bar
        oled.fill_rect(10, 30, i, 10, 1)  # Fill the loading bar
        oled.show()
        time.sleep(0.3)

    # Move servos to the default position
    set_servo_angle(servo_pan, 90)
    set_servo_angle(servo_tilt, 90)

    oled.fill(0)
    oled.text("Servos Ready!", 20, 25)
    oled.show()
    time.sleep(1)



# Function to check if all sensor readings are the same (with some tolerance)
def are_sensors_uniform():
    global LIGHT_VALUES
    max_value = max(LIGHT_VALUES)
    min_value = min(LIGHT_VALUES)
    
    # If the max deviation between the highest and lowest readings is less than the threshold, it's uniform
    if (max_value - min_value) <= LIGHT_THRESHOLD:
        return True
    return False






def select_channel(channel):
    try:
        if 0 <= channel <= 7:
            i2c0.writeto(TCA9548A_ADDR, bytearray([1 << channel]))
    except OSError:
        i2c0.init(freq=100000)

def read_bh1750():
    try:
        i2c0.writeto(BH1750_ADDR, b'\x10')
        time.sleep(0.03)
        data = i2c0.readfrom(BH1750_ADDR, 2)
        return int.from_bytes(data, 'big') / 1.2
    except OSError:
        return -1
    
    
    
    
    
    
    
# Function to check if one side is much brighter than the opposite side
def check_for_large_difference():
    left_side = (LIGHT_VALUES[0] + LIGHT_VALUES[2]) / 2
    right_side = (LIGHT_VALUES[1] + LIGHT_VALUES[3]) / 2
    
    if abs(left_side - right_side) > LIGHT_THRESHOLD:
        # There is a large difference between left and right side
        return True
    return False

# Function to adjust servo positions if there's too large a light difference
def adjust_servo_position():
    global CURRENT_PAN, CURRENT_TILT, LIGHT_VALUES

    left_side = (LIGHT_VALUES[0] + LIGHT_VALUES[2]) / 2
    right_side = (LIGHT_VALUES[1] + LIGHT_VALUES[3]) / 2
    
    # Calculate the difference in light levels between left and right sides
    diff_left_right = abs(left_side - right_side)
    
    # If one side is significantly brighter than the other, correct the servo
    if diff_left_right > LIGHT_THRESHOLD:
        if left_side > right_side:
            # Left side is much brighter, move the pan servo towards the right slowly
            print("Left side is brighter, correcting towards the right.")
            move_servo_smoothly(servo_pan, CURRENT_PAN + SCAN_ANGLE_STEP)
        else:
            # Right side is much brighter, move the pan servo towards the left slowly
            print("Right side is brighter, correcting towards the left.")
            move_servo_smoothly(servo_pan, CURRENT_PAN - SCAN_ANGLE_STEP)
    else:
        # The light levels are balanced, continue normal behavior
        print("Light levels are balanced, no correction needed.")
        
        
        

def set_servo_angle(servo, angle):
    duty = int(MIN_DUTY + (angle / 180) * (MAX_DUTY - MIN_DUTY))
    servo.duty_u16(duty)


def moving_average(new_value, values, window_size=5):
    values.append(new_value)
    if len(values) > window_size:
        values.pop(0)  # Keep the list size fixed
    return sum(values) / len(values)


def smooth_move(servo, current_angle, target_angle):
    angle_diff = abs(target_angle - current_angle)
    steps = max(1, int(angle_diff * 1))  # More steps for larger movements, at least 10 steps
    step_size = (target_angle - current_angle) / steps

    for _ in range(steps):
        current_angle += step_size
        set_servo_angle(servo, int(current_angle))  # Ensure integer values
        time.sleep(0.02 + (angle_diff / 2000))  # Increase delay for larger movements

    return target_angle  # Ensure exact target is reached


def determine_direction():
    global filtered_tl, filtered_tr, filtered_bl, filtered_br
    tl, tr, bl, br = LIGHT_VALUES

    
    ALPHA = 0.1  # Smoothing factor for the filter (0.0 to 1.0)
    filtered_tl = ALPHA * LIGHT_VALUES[0] + (1 - ALPHA) * filtered_tl
    filtered_tr = ALPHA * LIGHT_VALUES[1] + (1 - ALPHA) * filtered_tr
    filtered_bl = ALPHA * LIGHT_VALUES[2] + (1 - ALPHA) * filtered_bl
    filtered_br = ALPHA * LIGHT_VALUES[3] + (1 - ALPHA) * filtered_br


    # Tính sự khác biệt ngang và dọc
    diff_horizontal = ((filtered_tl + filtered_bl) - (filtered_tr + filtered_br)) / 2
    diff_vertical = ((filtered_tl + filtered_tr) - (filtered_bl + filtered_br)) / 2


    # Hệ số điều chỉnh
    DEAD_ZONE = 2  # If the change in angle is smaller than this, don't move the servo
    scaling_factor = 0.4
    pan_adjustment = max(min(diff_horizontal * scaling_factor, 30), -80)
    tilt_adjustment = max(min(diff_vertical * scaling_factor, 30), -80)
    
    #pan_adjustment = max(min(diff_horizontal * scaling_factor, 30), -30)
    #tilt_adjustment = max(min(diff_vertical * scaling_factor, 30), -30)

    # Tính góc mục tiêu
    target_pan = max(min(90 + pan_adjustment, 180), 0)
    target_tilt = max(min(90 + tilt_adjustment, 180), 0)

    
    # Update servo angles only if the difference is larger than the DEAD_ZONE
    if abs(target_pan - CURRENT_PAN) > DEAD_ZONE or abs(target_tilt - CURRENT_TILT) > DEAD_ZONE:
        TARGET_PAN = target_pan
        TARGET_TILT = target_tilt
        
    return target_pan, target_tilt



def moving_average(new_value, values, window_size=5):
    """Applies a moving average filter to smooth light sensor readings."""
    values.append(new_value)
    if len(values) > window_size:
        values.pop(0)  # Keep the list size fixed
    return sum(values) / len(values)


# Luồng 1: Đọc cảm biến, chuyển đổi tọa độ, hiển thị
def sensor_thread():
    global LIGHT_VALUES, TARGET_PAN, TARGET_TILT
    last_pan, last_tilt = TARGET_PAN, TARGET_TILT
    THRESHOLD = 1  # Minimum change threshold

    check_i2c_devices()
    initialize_servos()

    while True:
        # Read sensors and apply moving average
        for ch in range(4):
            select_channel(ch)
            raw_light = read_bh1750()
            LIGHT_VALUES[ch] = moving_average(raw_light, LIGHT_HISTORY[ch])

        # Determine direction
        new_pan, new_tilt = determine_direction()

        # Update target positions only if change is significant
        if abs(new_pan - last_pan) > THRESHOLD or abs(new_tilt - last_tilt) > THRESHOLD:
            TARGET_PAN, TARGET_TILT = new_pan, new_tilt
            last_pan, last_tilt = new_pan, new_tilt

        # Update OLED display
        oled.fill(0)
        for ch in range(4):
            oled.text(f"LS {ch+1}: {LIGHT_VALUES[ch]:.2f}", 0, ch * 15)
        oled.show()

        # Print sensor data
        print(f"X: {TARGET_PAN:.1f} | Y: {TARGET_TILT:.1f} | "
              f"LS1: {LIGHT_VALUES[0]:.2f} | LS2: {LIGHT_VALUES[1]:.2f} | "
              f"LS3: {LIGHT_VALUES[2]:.2f} | LS4: {LIGHT_VALUES[3]:.2f}")

        time.sleep(0.001)  # Adjust delay if needed

# Luồng 0: Điều khiển servo
def servo_thread():
    global CURRENT_PAN, CURRENT_TILT, TARGET_PAN, TARGET_TILT
    set_servo_angle(servo_pan, CURRENT_PAN)
    set_servo_angle(servo_tilt, CURRENT_TILT)

    while True:

        # Di chuyển servo nếu góc mục tiêu thay đổi
        if abs(CURRENT_PAN - TARGET_PAN) > 1 or abs(CURRENT_TILT - TARGET_TILT) > 1:
            CURRENT_PAN = smooth_move(servo_pan, CURRENT_PAN, TARGET_PAN)
            CURRENT_TILT = smooth_move(servo_tilt, CURRENT_TILT, TARGET_TILT)
        time.sleep(0.05)  # Tăng thời gian nghỉ để giảm tải

if __name__ == "__main__":

    _thread.start_new_thread(sensor_thread, ())

    servo_thread()
