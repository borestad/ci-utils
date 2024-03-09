# Custom config for grc-rs

GRC="$(which grc-rs)"

alias colourify="$GRC"

# Supported commands
cmds=(
  as
  ant
  blkid
  cc
  configure
  curl
  cvs
  df
  diff
  dig
  # dnf => Breaks installation questions [Y/N]
  docker
  docker-compose
  docker-machine
  du
  env
  fdisk
  findmnt
  free
  g++
  gas
  gcc
  getfacl
  getsebool
  gmake
  id
  ifconfig
  iostat
  ip
  iptables
  iwconfig
  journalctl
  kubectl
  last
  ldap
  lolcat
  ld
  ls
  lsattr
  lsblk
  lsmod
  lsof
  lspci
  make
  mount
  mtr
  mvn
  netstat
  nmap
  ntpdate
  php
  ping
  ping6
  proftpd
  ps
  sar
  semanage
  sensors
  showmount
  sockstat
  ss
  stat
  sysctl
  systemctl
  tcpdump
  traceroute
  traceroute6
  tune2fs
  ulimit
  uptime
  vmstat
  wdiff
  whois
)

# Set alias for available commands.
for cmd in ${cmds[@]} ; do
  _cmd=$(command -v $cmd);

  if [ ! -z "$_cmd" ] ; then
    echo $_cmd | grep '/' &> /dev/null && alias $cmd="colourify $_cmd"
  fi
done
