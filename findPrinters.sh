#!/bin/bash

# Create or clear the .env file
ENV_FILE=".env"
> $ENV_FILE

# Function to resolve IP using arp and ping the available IP addresses
resolve_and_write() {
    local hostname=$1
    local index=$2

    # Use arp to find all IP addresses corresponding to the hostname
    ips=$(arp -a | grep "$hostname" | awk '{print $2}' | tr -d '()')

    for ip in $ips; do
        # Ping the IP address and check if it responds
        if ping -c 1 "$ip" &> /dev/null; then
            echo "Found $hostname at $ip"
            echo "PRINTER_$index=http://$ip:7125" >> $ENV_FILE
            return
        fi
    done

    # If no IP address responded to the ping, note it
    echo "Could not resolve $hostname"
    echo "PRINTER_$index=" >> $ENV_FILE
}

# Loop through neptune1 to neptune4
for i in {1..4}
do
    resolve_and_write "neptune$i" "$i"
done

echo ".env file created:"
cat $ENV_FILE
