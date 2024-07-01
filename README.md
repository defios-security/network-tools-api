# NetworkToolsAPI

NetworkToolsAPI is a Node.js application that provides REST API endpoints for network diagnostic tools such as dig, ping, traceroute, and nmap.

## Prerequisites

Before you begin, ensure you have Docker installed on your machine. You can download Docker from [Docker's official website](https://www.docker.com/get-started).

## Getting Started

To run NetworkToolsAPI inside a Docker container, follow these steps:


1. **Clone the repository:**

```bash
git clone https://github.com/irradiatedcircle/network-tools-api.git
cd NetworkToolsAPI
```

   
2. Build the Docker image:

```
docker build -t networktoolsapi .
```


3. Run the Docker container:

```
docker run -d -p 8080:8080 networktoolsapi
```


## Verify the deployment:

Open your web browser and navigate to http://localhost:8080/health. You should see a JSON response `{ "status": "OK" }`, indicating that the server is running successfully.


## API Endpoints

The following endpoints are available:

| Endpoint      | Description                             | Parameters                                     | Example                              |
|---------------|-----------------------------------------|-------------------------------------------------|--------------------------------------|
| `/dig`        | Perform DNS lookup using `dig`.         | `domain` (required), `type` (optional, default: `A`) | `/dig?domain=example.com&type=A`     |
| `/ping`       | Ping a host using ICMP.                 | `host` (required)                              | `/ping?host=example.com`             |
| `/traceroute` | Perform a traceroute to a host.         | `host` (required)                              | `/traceroute?host=example.com`       |
| `/nmap`       | Scan a host for open ports using `nmap`.| `host` (required), `options` (optional)         | `/nmap?host=example.com&options=-sV` |
| `/health`     | Health check endpoint.                  | None                                            | `/health`                            |
| `/whois`      | Perform a whois lookup.                 | `domain` (required)                            | `/whois?domain=example.com`            |

Troubleshooting
Server is busy: If the server is busy handling maximum concurrent tasks (MAX_CONCURRENT_TASKS), requests are queued and processed sequentially.
