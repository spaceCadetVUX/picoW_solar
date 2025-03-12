import _thread
from machine import Pin, I2C
import network
import time
import urequests
from ssd1306 import SSD1306_I2C

# Wi-Fi Credentials
SSID = "Swift_1989"
PASSWORD = "11111111"

# Firebase Database URL (Modify with your actual database path)
FIREBASE_URL = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/light_parameter.json"

# Initialize I2C buses
i2c0 = I2C(0, scl=Pin(1), sda=Pin(0), freq=100000)  # For sensors
i2c1 = I2C(1, sda=Pin(14), scl=Pin(15), freq=400000)  # For OLED

# TCA9548A I2C address
TCA9548A_ADDR = 0x70

# BH1750 I2C address
BH1750_ADDR = 0x23

# Initialize OLED Display
oled = SSD1306_I2C(128, 64, i2c1)

# Light sensor values
light_values = [0, 0, 0, 0]

def connect_wifi():
    """ Connects to Wi-Fi """
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)

    while not wlan.isconnected():
        print("Connecting to Wi-Fi...")
        time.sleep(1)

    print("Connected to Wi-Fi:", wlan.ifconfig())

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

def send_to_firebase(data):
    """ Sends light sensor data to Firebase """
    headers = {'Content-Type': 'application/json'}
    response = urequests.patch(FIREBASE_URL, json=data, headers=headers)  # Use PATCH to update existing fields
    print("Firebase Response:", response.text)
    response.close()

def read_and_display():
    while True:
        oled.fill(0)  # Clear OLED

        for ch in range(4):  # Read from 4 channels
            select_channel(ch)
            lux = read_bh1750()
            light_values[ch] = lux
            oled.text(f"LS {ch+1}: {lux:.2f} Lux", 0, ch * 15)  # Display readings

        # Show values on OLED
        oled.show()
        time.sleep(0.01)  # Read sensors as fast as possible

def update_firebase():
    connect_wifi()
    while True:
        data = {
            "sensor1": light_values[0],
            "sensor2": light_values[1],
            "sensor3": light_values[2],
            "sensor4": light_values[3]
        }
        send_to_firebase(data)
        print("Updated Firebase:", light_values)
        time.sleep(5)  # Update Firebase every 5 seconds

# Start reading and displaying on core 0
_thread.start_new_thread(read_and_display, ())

# Start updating Firebase on core 1
_thread.start_new_thread(update_firebase, ())

# Keep the main thread running
while True:
    time.sleep(1)
