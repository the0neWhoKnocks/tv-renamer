# Installation on FreeNAS

This was written with FreeNAS `v9.10.2` in mind and utilizes `iohyve`,
AKA the hypervisor **BHyve**.

---

## Preliminary Steps

1. Log into FreeNAS 
1. Get the **name of the Pool** by going to `Storage > Volumes` and find the
  `name` of the pool where the VM will be installed.
1. Get the **name of the Interface** by going to `Network > Network Summary`
  and there should be a name like `em0` with an IP next to it.

---

## Installing the iohyve environment

1. SSH into the NAS, and switch to the `root` user. For me that means SSH'ing
  onto the box, then typing `su` followed by the `root` password. Usually it's
  the same password used to log into the FreeNAS GUI.
  - You should now be able to type `iohyve` and see a list of available commands.
1. Now we'll set up the ZFS dataset with
  
  ```sh
  iohyve setup pool=<POOL_NAME> kmod=1 net=<INTERFACE_NAME>
  ```
  `<POOL_NAME>` and `<INTERFACE_NAME>` being the values from the preliminary
  steps.

---

## Create tunables

1. In the FreeNAS GUI, go to `System > Tunables`
2. Tell `iohyve` to load on boot
  - Click `Add Tunable`

| Name     | Value                 |
| -------- | --------------------- |
| Variable | `iohyve_enable`       |
| Value    | `YES`                 |
| Type     | `rc.conf`             |
| Comment  | `Load iohyve on boot` |

3. Tell `iohyve` to run with the same flags we just executed during the install
  - Click `Add Tunable`

| Name     | Value                         |
| -------- | ----------------------------- |
| Variable | `iohyve_flags`                |
| Value    | `kmod=1 net=<INTERFACE_NAME>` |
| Type     | `rc.conf`                     |
| Comment  | `Run iohyve with these flags` |

4. Not sure what this does, but apparently it's needed.
  - Click `Add Tunable`

| Name     | Value          |
| -------- | -------------- |
| Variable | `ng_ther_load` |
| Value    | `YES`          |
| Type     | `rc.conf`      |
| Comment  |                |

---

## Installing RancherOS 

[RancherOS](https://github.com/rancher/os) is a small Linux OS built
specifically to run Docker.

1. Find the version you want to install on [their releases](https://github.com/rancher/os/releases)
  page. At the time of writing this I used `v1.5.1`.
1. Download the iso by running
```sh
iohyve fetch https://releases.rancher.com/os/v1.5.1/rancheros.iso
iohyve renameiso rancheros.iso rancheros_v1.5.1.iso
```
  - You can validate by running `iohyve isolist`.
1. Before setting up the VM you'll want to get some specs for your machine.

```sh
# Get the CPU count
sysctl hw.model hw.machine hw.ncpu

# Get the available memory
grep memory /var/run/dmesg.boot
```

4. Create the VM

```sh
# 20G is the size of the VM
iohyve create rancher 20G

# Change ram, and cpu to what best suits your systems capabilities
iohyve set rancher loader=grub-bhyve ram=2G cpu=1 con=nmdm0 os=debian

# validate
iohyve list
```

5. Installing the OS into the VM is a 2 step process. You'll want 2 terminals
  SSH'd into FreeNAS as `root`.
  - In terminal 1 start up the console so that when the install begins we see
    everything that's output.
    ```sh
    iohyve console rancher
    ```
  - In terminal 2 you'll run the below command. The terminal will appear to hang
    but as stated by the output, you'll have to complete the setup in terminal 1.
    ```sh
    # starts the install
    iohyve install rancher rancheros_v1.5.1.iso
    ```
  - NOTE - If you have an issue with grub freezing up, SSH in to FreeNAS in
    another terminal and run
    ```sh
    iohyve forcekill rancher
    bhyvectl --destroy --vm=rancher
    iohyve conreset
    ```
    If that doesn't work
    ```sh
    pkill -9 grub-bhyve
    pkill -9 bhyve
    ```
  - In terminal 1 run the below command. If you don't see `grub >` then hit
    `ENTER` and the `grub` terminal should appear.
    ```sh
    # vm setup
    set root=(cd0,msdos1)
    linux /boot/vmlinuz* ro rancher.password=rancher
    initrd /boot/initrd*
    boot
    ```
    Depending on your system, the boot could take a few minutes. Eventually
    you'll be prompted to log in. The user and password will be `rancher`.
    - Once logged in, we'll configure the OS. Run
      ```sh
      vi cloud-config.yml
      ```
      Then add the below contents. Change `<YOUR-SSH-KEY>` to your public key,
      and update the `addresses` and `gateway` to an IP range that suits your
      network.
      ```sh
      #cloud-config
      hostname: rancheros

      rancher:
        network:
          dns:
            nameservers:
              - 8.8.8.8
              - 8.8.4.4
          
          interfaces:
            eth0:
              addresses:
                - 192.168.1.80/24
              gateway: 192.168.1.1
              dhcp: false

      ssh_authorized_keys:
        - ssh-rsa <YOUR-SSH-KEY>
      ```
    - Validate the config
      ```sh
      sudo ros config validate -i cloud-config.yml
      ```
    - Finalize the install from your new config
      ```sh
      sudo ros install -c cloud-config.yml -d /dev/sda
      ```
      - It'll ask to reboot, say Yes. It'll start to do something, then stop.
        Seemingly that's ok, so close terminal 1 and go back to the other
        FreeNAS terminal.
6. Create a Grub config so you don't have to deal with it on start

```sh
vi /mnt/iohyve/rancher/grub.cfg

set root=(hd0,1)
linux /boot/vmlinuz* printk.devkmsg=on rancher.state.dev=LABEL=RANCHER_STATE rancher.state.wait console=tty0 ro rancher.password=rancher
initrd /boot/initrd*
boot
```

7. Set `rancher` to boot after FreeNAS restarts, and start up the VM.

```sh
iohyve set rancher os=custom boot=1
iohyve start rancher
```

8. You should be able to ssh into Rancher now. If not, try going into
  `iohyve console rancher` and there should be some ASCII art of Rancher OS.
  Below that will be listed the IP next to `eth0`. If you're not able to ssh
  into that IP, I dunno what to tell yuh.
  - If things are working, for good measure I ran `iohyve stop rancher` and
    `iohyve start rancher` a few times to ensure that the static IP is
    assigned correctly and I was able to ssh in.

---

## Adding Portainer

SSH into `rancher`.

```sh
sudo vi /var/lib/rancher/conf/cloud-config.d/portainer.yml
```

```sh
#/var/lib/rancher/conf/cloud-config.d/portainer.yml
rancher:
  services:
    portainer:
      image: portainer/portainer
      container_name: 'portainer'
      environment:
        PGID: '1101'
        PUID: '1101'
        TZ: America/Los_Angeles
      labels:
        io.rancher.os.after: console, preload-user-images
      privileged: true
      restart: always
      ports:
        - '9000:9000'
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock
        - /mnt/config/portainer:/data
```

```sh
sudo reboot
```

Try hitting up `<IP>:9000`. If nothing shows up, give it a couple minutes. I
initially tried loading the page and nothing happened then it eventually woke up.

---

## Misc. Rancher OS Notes

- Configuration locations
```sh
# Folder of all configs
/var/lib/rancher/conf/cloud-config.d/
# The config that controls the system (seems to be a copy of what's run during install)
/var/lib/rancher/conf/cloud-config.d/user_config.yml
```
- You can `sudo su` to switch to `root` so you don't have to prefix all `ros`
  commands with `sudo`.
- If I needed to update config options in the OS I found it was easiest to
  run `sudo vi /var/lib/rancher/conf/cloud-config.d/user_config.yml`, make my
  changes, and restart the VM via `iohyve`;