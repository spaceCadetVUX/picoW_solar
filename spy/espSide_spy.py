import network
import time
import urequests
import json


import machine
import ujson


# Firebase Database URL
FIREBASE_URL = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/light_parameter.json"
FIREBASE_URL_sc = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/scollers.json"
FIREBASE_URL_auto = "https://schooldatabase-63900-default-rtdb.firebaseio.com/main/86gQQY9K1Xc3CqQaQ6MUO9nu5472/rom1/buttons.json"

# Wi-Fi credentials
SSID = "swift_1989"
PASSWORD = "11111111"

# Define UART on ESP8266
uart = machine.UART(0, baudrate=115200)  # TX=GPIO1, RX=GPIO3 (default UART)

# Data to send
AUTO_MODE_TO_SEND = True
X_AXIS_TO_SEND = 0
Y_AXIS_TO_SEND = 0

# Data to receive
LIGHT_VALUES_TO_RECEIVE = [0, 0, 0, 0]
X_AXIS_TO_RECEIVE = 0
Y_AXIS_TO_RECEIVE = 0





def connect_to_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    print(f"Connecting to Wi-Fi SSID: {ssid}...")

    for _ in range(10):
        if wlan.isconnected():
            print("Connected to Wi-Fi!")
            print("Device IP:", wlan.ifconfig()[0])
            return True
        time.sleep(1)

    print("Failed to connect to Wi-Fi.")
    return False
# get light 
def get_firebase_data_light():
    try:
        response = urequests.get(FIREBASE_URL)
        if response.status_code == 200:
            data = response.json()
            print("Firebase Data:", data)
            return data
        else:
            print("Failed to fetch data. HTTP Code:", response.status_code)
    except Exception as e:
        print("Error:", e)
    finally:
        response.close()
        



# set light
def set_firebase_data(S1, S2, S3, S4):
    new_data = {
        "S1": S1,
        "S2": S2,
        "S3": S3,
        "S4": S4
    }

    try:
        headers = {"Content-Type": "application/json"}
        response = urequests.patch(FIREBASE_URL, data=json.dumps(new_data), headers=headers)
        if response.status_code == 200:
            print("Updated Firebase Data:", new_data)
        else:
            print("Failed to update data. HTTP Code:", response.status_code)
    except Exception as e:
        print("Error:", e)
    finally:
        # Ensure response is closed only if it was successfully created
        try:
            response.close()
        except NameError:
            pass



#get slider:
def get_firebase_data_sc():
    try:
        response = urequests.get(FIREBASE_URL_sc)
        if response.status_code == 200:
            data = response.json()
            print("Firebase Data:", data)
            return data
        else:
            print("Failed to fetch data. HTTP Code:", response.status_code)
    except Exception as e:
        print("Error:", e)
    finally:
        response.close()
        


# set slider
def set_firebase_data_sl(x_axis, y_axis, sensitivity):
    new_data = {
        "X-axis": x_axis,        # Keep keys as expected in Firebase
        "Y-axis": y_axis,
        "sensitivity": sensitivity,
    }

    try:
        headers = {"Content-Type": "application/json"}
        response = urequests.patch(FIREBASE_URL_sc, data=json.dumps(new_data), headers=headers)
        if response.status_code == 200:
            print("Updated slider:", new_data)
        else:
            print("Failed to update data. HTTP Code:", response.status_code)
    except Exception as e:
        print("Error:", e)
    finally:
        try:
            response.close()
        except NameError:
            pass

#get auto:
def get_firebase_data_auto():
    global auto  # Access the global variable

    try:
        response = urequests.get(FIREBASE_URL_auto)
        if response.status_code == 200:
            data = response.json()
            print("Firebase Data:", data)
            
            # Update global variable based on fetched data
            auto = True if data.get("automatic") else False
            print("Auto Mode:", auto)

        else:
            print("Failed to fetch data. HTTP Code:", response.status_code)

    except Exception as e:
        print("Error:", e)

    finally:
        try:
            response.close()
        except NameError:
            pass


# data to send
def send_data():
    """Send data from ESP8266 to Pico W via UART"""
    global AUTO_MODE_TO_SEND, X_AXIS_TO_SEND, Y_AXIS_TO_SEND
    data = {
        "auto": AUTO_MODE_TO_SEND,
        "x": X_AXIS_TO_SEND,
        "y": Y_AXIS_TO_SEND
    }
    json_data = ujson.dumps(data) + "\n"  # Convert to JSON and add newline
    uart.write(json_data)


# data receive
def receive_data():
    """Receive data from Pico W and update global variables"""
    global LIGHT_VALUES_TO_RECEIVE, X_AXIS_TO_RECEIVE, Y_AXIS_TO_RECEIVE

    if uart.any():  # Check if data is available
        try:
            received = uart.readline()  # Read a line from UART
            if received:
                received = received.decode().strip()  # Decode and clean up

                print("Received:", received)  # Debug print

                # Ensure valid JSON
                if received.startswith("{") and received.endswith("}"):
                    data = ujson.loads(received)

                    # Update global variables if keys exist
                    LIGHT_VALUES_TO_RECEIVE = data.get("light", LIGHT_VALUES_TO_RECEIVE)
                    X_AXIS_TO_RECEIVE = data.get("x", X_AXIS_TO_RECEIVE)
                    Y_AXIS_TO_RECEIVE = data.get("y", Y_AXIS_TO_RECEIVE)

                    print(f"Updated Values - Light: {LIGHT_VALUES_TO_RECEIVE}, X: {X_AXIS_TO_RECEIVE}, Y: {Y_AXIS_TO_RECEIVE}")
                else:
                    print("Invalid JSON format received.")

        except Exception as e:
            print("UART Receive Error:", e)



# Main Function
def main():
    if connect_to_wifi(SSID, PASSWORD):
        print("Connected to Wi-Fi!")

        while True:
            receive_data()  # Check for UART data
            S1, S2, S3, S4 = LIGHT_VALUES_TO_RECEIVE[:4]
            set_firebase_data(S1, S2, S3, S4)  # Send data to Firebase

            time.sleep(0.1)  # Reduce delay to allow frequent UART checks
if __name__ == "__main__":
    main()


