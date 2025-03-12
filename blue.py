import network
import socket
import time

def start_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid='PicoW_Setup', password='12345678')  # SSID and password
    print("Access Point started. SSID: PicoW_Setup, Password: 12345678")
    print("AP IP:", ap.ifconfig()[0])
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
            return True
        time.sleep(1)

    print("Failed to connect to Wi-Fi.")
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

# Main Function
def main():
    ap = start_ap()
    start_captive_portal(ap)

if __name__ == "__main__":
    main()
