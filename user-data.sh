#!/bin/bash
OS_TYPE=$(grep ^ID= /etc/os-release | cut -d'=' -f2 | sed 's/"//g')

if [ "$OS_TYPE" == "ubuntu" ]; then
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker ubuntu

elif [[ "$OS_TYPE" == "amzn" || "$OS_TYPE" == "al2023" ]]; then
    dnf update -y
    dnf install -y docker
    usermod -aG docker ec2-user
fi

systemctl enable docker
systemctl start docker