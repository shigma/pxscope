curl -o wine-3.0.2.tar.xz https://dl.winehq.org/wine/source/3.0/wine-3.0.2.tar.xz
tar xf wine-3.0.2.tar.xz
cd wine-3.0.2
sudo apt-get update
sudo apt-get install build-essential
./configure
make
