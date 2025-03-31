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


# Firebase Database URL (Modify with your actual database path)
FIREBASE_URL = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/light_parameter.json"

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
servo_pan = PWM(Pin(18))  # Pan servo connected to GPIO 18
servo_tilt = PWM(Pin(19)) # Tilt servo connected to GPIO 19

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
# servo path
# Function to set the servo motor angle
def set_servo_angle(servo, angle):
    duty = int(MIN_DUTY + (angle / 180) * (MAX_DUTY - MIN_DUTY))  # Convert angle to PWM duty cycle
    servo.duty_u16(duty)  # Apply duty cycle to servo
    
# Function to smoothly move servo between angles
def smooth_move(servo, current_angle, target_angle, steps=100):
    step_size = (target_angle - current_angle) / steps  # Calculate step size
    for i in range(steps):
        set_servo_angle(servo, current_angle + i * step_size)  # Incrementally move servo
        time.sleep(0.01)  # Small delay for smooth movement




# Function to determine direction based on light intensity differences
def determine_direction():
    left_light = (LIGHT_VALUES[0] + LIGHT_VALUES[2]) / 2  # Average left-side sensors
    right_light = (LIGHT_VALUES[1] + LIGHT_VALUES[3]) / 2  # Average right-side sensors
    top_light = (LIGHT_VALUES[0] + LIGHT_VALUES[1]) / 2  # Average top sensors
    bottom_light = (LIGHT_VALUES[2] + LIGHT_VALUES[3]) / 2  # Average bottom sensors
    
    # Calculate smoothed light differences
    horizontal_diff = ALPHA * (right_light - left_light)
    vertical_diff = ALPHA * (top_light - bottom_light)
    
    # Determine movement angles within bounds
    pan_angle = max(-30, min(30, horizontal_diff))
    tilt_angle = max(-30, min(30, vertical_diff))
    return pan_angle, tilt_angle


# Function to control servo movement based on light tracking

        

        
# Function to rotate OLED screen by 180 degrees
def rotate_oled_180():
    buffer = oled.buffer[:]  # Copy OLED pixel data
    for y in range(64):
        for x in range(128):
            oled.pixel(x, y, buffer[128 * (63 - y) + (127 - x)])  # Reverse pixel positions
    oled.show()
        








def select_channel(channel):
    """ Selects the TCA9548A channel """
    if 0 <= channel <= 7:
        i2c0.writeto(TCA9548A_ADDR, bytearray([1 << channel]))

def read_bh1750():
    """ Reads light level from BH1750 sensor """
    i2c0.writeto(BH1750_ADDR, b'\x10')  # 1lx resolution, continuous mode
    time.sleep(0.03)  # Wait for measurement
    data = i2c0.readfrom(BH1750_ADDR, 2)
    lux = int.from_bytes(data, 'big') / 1.2  # Convert to Lux
    return lux



def start_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid='SolarD', password='12345678')  # SSID and password
    print("Access Point started. SSID: SolarD, Password: 12345678")
    print("AP IP:", ap.ifconfig()[0])
    
    # Oled
    oled.fill(0)  # Clear OLED screen
    oled.text("SSID: SolarD", 0, 0)  # Display SSID
    oled.text("Pass: 12345678", 0, 10)  # Display Password
    
    # Display IP address
    ip_address = ap.ifconfig()[0]  # Get IP address
    oled.text(f"IP: {ip_address}", 0, 20)  # Display IP on OLED

    oled.show()  # Update OLED screen
    return ap


def stop_ap(ap):
    ap.active(False)
    print("Access Point stopped.")
    


def connect_to_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    print(f"Connecting to Wi-Fi SSID: {ssid}...")

    for _ in range(10):
        if wlan.isconnected():
            print("Connected to Wi-Fi!")
            print("Device IP:", wlan.ifconfig()[0])
            
            # Display connection success on OLED
            oled.fill(0)  # Clear OLED screen
            oled.text("Connected!", 0, 0)  
            oled.text("Device IP:", 0, 10)
            DvID = wlan.ifconfig()[0]
            oled.text(f"{DvID}", 0, 20)
            oled.show()  # Update OLED screen

            # Keep the message on screen for 5 seconds
            time.sleep(5)  
            
            return True

        time.sleep(1)

    # Display connection failure on OLED
    print("Failed to connect to Wi-Fi.")
    oled.fill(0)  # Clear OLED screen
    oled.text("Wi-Fi connection:", 0, 0)
    oled.text("Failed!", 0, 10)
    oled.show()  # Update OLED screen

    # Keep the failure message on screen for 5 seconds
    time.sleep(5)

    return False


def start_captive_portal(ap):
    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print("Captive portal started. Listening for connections...")

    while True:
        cl, addr = s.accept()
        print('Client connected from', addr)
        request = cl.recv(1024).decode('utf-8')
        print("Request:", request)

        if 'POST /wifi' in request:
            try:
                body = request.split('\r\n\r\n')[1]
                params = {p.split('=')[0]: p.split('=')[1] for p in body.split('&')}
                ssid = params['ssid'].replace('%20', ' ')  # Decode URL encoding
                password = params['password']
                print(f"Received Wi-Fi Credentials: SSID={ssid}, Password={password}")

                response = "HTTP/1.1 200 OK\r\n\r\nConnecting to Wi-Fi..."
                cl.send(response)
                cl.close()

                # Attempt to connect to Wi-Fi
                if connect_to_wifi(ssid, password):
                    stop_ap(ap)
                    return
                else:
                    print("Retry Wi-Fi configuration.")
            except Exception as e:
                print("Error handling request:", e)
                cl.send("HTTP/1.1 400 Bad Request\r\n\r\nInvalid request.")
                cl.close()

        else:
            # Serve the captive portal page
            html = """\
HTTP/1.1 200 OK

<!DOCTYPE html>
<html>
<head>
    <title>Pico W Wi-Fi Setup</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Makes the page scale properly on mobile -->
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 60%; /* Ensures it fits well on smaller screens */
            width: 250px; /* For larger screens */
            text-align: center;
        }

        h1 {
            font-size: 22px;
            color: #333;
            margin-bottom: 20px;
        }

        label {
            font-size: 16px;
            color: #555;
            display: block;
            text-align: left;
            margin-bottom: 5px;
        }

        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
        }

        input[type="submit"] {
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 16px;
        }

        input[type="submit"]:hover {
            background-color: #218838;
        }

        small {
            display: block;
            margin-top: 10px;
            color: #777;
        }

        /* Adjustments for smaller screens */
        @media (max-width: 400px) {
            h1 {
                font-size: 20px;
            }

            input[type="text"], input[type="password"], input[type="submit"] {
                font-size: 14px;
            }

            .container {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Wi-Fi Configuration</h1>
        <form action="/wifi" method="post">
            <label for="ssid">SSID:</label>
            <input type="text" id="ssid" name="ssid" placeholder="Enter Wi-Fi SSID">
            <label for="password">Password:</label>
            <input type="text" id="password" name="password" placeholder="Enter Wi-Fi Password">
            <input type="submit" value="Submit">
        </form>
        <small>Enter your Wi-Fi credentials to connect.</small>
    </div>
</body>
</html>

"""
            cl.send(html)
            cl.close()





def send_to_firebase(data):
    """ Sends data to Firebase """
    try:
        response = urequests.put(FIREBASE_URL, data=ujson.dumps(data), headers={"Content-Type": "application/json"})
        print("Data sent to Firebase:", response.text)
        response.close()
    except Exception as e:
        print("Failed to send data to Firebase:", e)

def update_firebase_and_display():
    """ Reads sensor data, updates Firebase, and displays on OLED """
    while True:
        data = {}
        oled.fill(0)  # Clear OLED

        for ch in range(4):  # Read from 4 channels
            select_channel(ch)
            lux = read_bh1750()
            LIGHT_VALUES[ch] = lux
            data[f"S{ch+1}"] = lux

            # Display readings on OLED
            oled.text(f"LS {ch+1}: {lux:.2f} Lux", 0, ch * 15)
            print(f"LS {ch+1}: {lux:.2f} Lux")
        # Show values on OLED
        oled.show()
        print(LIGHT_VALUES)
        # Send updated values to Firebase
        send_to_firebase(data)
        # Wait before the next update
        time.sleep(0.1)
        


def control_servos():

    pan_angle = 90  # Start position
    tilt_angle = 90
    set_servo_angle(servo_pan, pan_angle)
    set_servo_angle(servo_tilt, tilt_angle)
    
    while True:
        for ch in range(4):  # Read from 4 channels
            select_channel(ch)
            lux = read_bh1750()
            LIGHT_VALUES[ch] = lux
            data[f"S{ch+1}"] = lux

            # Display readings on OLED
            oled.text(f"LS {ch+1}: {lux:.2f} Lux", 0, ch * 15)
            print(f"LS {ch+1}: {lux:.2f} Lux")
            
        pan_adjust, tilt_adjust = determine_direction()  # Get required adjustments
        pan_angle = max(0, min(180, pan_angle + pan_adjust))  # Constrain angles
        tilt_angle = max(0, min(180, tilt_angle + tilt_adjust))
        smooth_move(servo_pan, pan_angle, pan_angle + pan_adjust)  # Move servos smoothly
        smooth_move(servo_tilt, tilt_angle, tilt_angle + tilt_adjust)
        
        
        print(pan_angle)
        print(tilt_angle)
        
        # Update OLED display
        # Show values on OLED
        oled.show()
        print(LIGHT_VALUES)
        # Send updated values to Firebase
        send_to_firebase(data)
        # Wait before the next update
        time.sleep(0.1)

        time.sleep(0.1)
        
        

        
led = machine.Pin("LED", machine.Pin.OUT)

def while_led():
    while True:
        led.on()   # Turn LED on
        time.sleep(0.1)  # Wait 1 second
        led.off()  # Turn LED off
        time.sleep(0.1)  # Wait 1 second
        
        
def abc(data):
    while True:
        send_to_firebase(data)
        print(".......",data)
        time.sleep(2)
        
        
        

FIREBASE_URL_sc = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers.json"




def set_data_with_put(data):
    """Sets (uploads) data to Firebase using PUT"""
    try:
        response = urequests.put(FIREBASE_URL_sc, data=ujson.dumps(data), headers={"Content-Type": "application/json"})
        print("Data successfully set:", response.text)
        response.close()
    except Exception as e:
        print("Failed to set data:", e)
        
def send():
    
    data_to_set = {
    "X-axis": 100,
    "Y-axis": 50,
    "sensitivity": 10
    }
    while True:
        set_data_with_put(data_to_set)
        time.sleep(3)

# Main Function
def main():
    
    connect_to_wifi('swift_1989','11111111')

    
    _thread.start_new_thread(send,())
    
    # Start control_servos on a separate thread
    control_servos()


    

    

if __name__ == "__main__":
    main()





