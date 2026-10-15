# Diptera Workspace

A standalone directory of internal company tools, with search and category filters.

## Preview locally

From this directory run:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. No dependencies or build step are required.

Edit `dist/index.html` to update the page and tool links. Internal tools require access to the company network or VPN.

## Run on office as a service

The provided service runs a dedicated Nginx instance as `dipt-net`, serving
`/home/dipt-net/dipteraUI/diptera-workspace/dist` on port **8090**.
It starts at boot and restarts after failure. It uses its own configuration and
PID file, independent of any existing Nginx instance.

After committing/pushing these files and pulling them on `office`, run there:

```sh
sudo apt-get update
sudo apt-get install -y nginx-core
cd /home/dipt-net/dipteraUI/diptera-workspace
sudo install -d -m 755 /etc/diptera-workspace
sudo install -m 644 deploy/nginx.conf /etc/diptera-workspace/nginx.conf
sudo install -m 644 deploy/diptera-workspace.service /etc/systemd/system/diptera-workspace.service
sudo systemctl daemon-reload
sudo systemctl enable --now diptera-workspace
sudo systemctl status diptera-workspace --no-pager
curl -I http://localhost:8090
```

Nginx package installation may also start Ubuntu's default `nginx.service` on
port 80; this dedicated service uses port 8090. Do not disable an existing Nginx
service if other applications depend on it.

Open `http://office:8090` if your device resolves `office`, or use the office
machine's reachable IP address. An SSH alias alone does not make `office` a
browser hostname. Users need network/VPN access to this port and to each linked
tool. If a firewall blocks access, allow TCP 8090 only from your company network
or VPN. This page has no login of its own.

Updates to the HTML and assets take effect after `git pull`; no service restart
is required. After configuration changes, reinstall the configuration and run
`sudo systemctl restart diptera-workspace`.

Troubleshooting:

```sh
sudo journalctl -u diptera-workspace -n 50 --no-pager
sudo ss -ltnp 'sport = :8090'
```
