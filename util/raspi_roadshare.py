from sense_hat import SenseHat
import numpy as np;
import os
import sys
import datetime
from time import sleep,time
import threading

g=9.80665 #from scipy.constants import g; 

def enbuffer(ts,tup):
    global G_buf,G_flock,G_sock,G_HALT
    
    try:
        G_flock.acquire();
        G_buf.append([ts,tup[0],tup[1],tup[2]]);
        G_flock.release();

        return True;
    except:
        return False;

def clearbuffer(N=None):
    global G_buf,G_flock,G_sock
    tmp=None;

    G_flock.acquire();
    if N is not None:
        tmp=G_buf[:N];
        G_buf=G_buf[N:];
    else:
        tmp=G_buf[:];
        G_buf=[];
    G_flock.release();
    
    n_=len(tmp);

    return n_,tmp;


def readthread():
    global G_buf,G_flock,G_sock,G_HALT
    while (G_buf is None or G_flock is None or G_sock is None):
        sleep(.1);
    while not G_HALT and not os.path.isfile("halt"):
        accel = sense.accel_raw;
        t=time()
        ret=enbuffer(t,(accel['x']/g,accel['y']/g,accel['z']/g));
        if not ret:
            print("Error writing to buffer at time %d"%t)

        sleep(0.005);
    print("Polling thread terminated.")


def writethread():
    global G_buf,G_flock,G_sock,G_HALT
    #Acquire data from the buffer, wrap up into a series of HTTP.GETs
    # that pass a JSON object with the following fields:
    #   - .latitude
    #   - .longitude
    #
    while (G_buf is None or G_flock is None or G_sock is None):
        sleep(.1);

    d=datetime.datetime.now()
    fout=open("/accel_dump%02d%02d.csv"%(d.hour,d.minute),"w");
    fout.write("time,GPS_lat,GPS_long,accelx,accely,accelz\n");
    
    while not G_HALT and not os.path.isfile("halt"):
        n,items=clearbuffer();
        #print("logging N=%d items"%n)
        for i in range(n):
            fout.write("%f,0,0,%f,%f,%f\n"%tuple(items[i]));
        fout.flush()
        sleep(0.05);
    print("Posting thread terminated.")

sense=SenseHat();
sense.set_imu_config(False,False,True)

def main(argc, argv):
    global G_buf,G_flock,G_sock,G_HALT
    G_buf = G_flock = G_sock = None;
    G_HALT = False;
    
    for x in range(8):
        for y in range(8):
            sense.set_pixel(x,(7-y) if x%2==0 else y,200,0,0)
            sleep(.01)
    print("Ready");


    t1=threading.Thread(target=readthread);
    t2=threading.Thread(target=writethread);
    sense.clear();

    G_buf=[];
    G_flock=threading.Lock();
    G_sock=-1;

    t1.start();
    t2.start();

    halt=False
    while not halt:
        sleep(.08)
        t=time();
        toprint=[(0,0,150*((1<<i)&int(t*1000))>>i) for i in range(64)]
        sense.clear();
        sense.set_pixels(toprint);

        t1.join(0.01);
        t2.join(0.01);
        if (not t1.is_alive() or not t2.is_alive()):
            G_HALT=halt=True;
            t1.join()
            t2.join()
            print("Program Terminated")
            return

if __name__ == "__main__":
    main(len(sys.argv),sys.argv)