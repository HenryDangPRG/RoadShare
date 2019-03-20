import requests
import json
import argparse
import time
import sys

parser=argparse.ArgumentParser(description='Generate HTTP GET traffic on 8080 from csv file');
parser.add_argument('infile')
parser.add_argument('--user-id',type=int,default=1)
parser.add_argument('--route-id',type=int,default=1)
parser.add_argument('--speedup',type=float,default=None)
parser.add_argument('--chunk-by',type=int,default=10)
parser.add_argument('-v,','--verbose',action='store_true')
args=parser.parse_args()

routeId=None;
userId=None;

#rid_query = 'localhost:8080/newroute'
routeId=args.route_id;
userId=args.user_id;

url = 'http://localhost:8080/data'

def push(url,params,data):
    good=False;
    data=json.dumps(data)
    while not good:
        resp=requests.post(url=url,params=params,json=payload);
        good=(resp.status_code==requests.codes.ok)
        if not good:
            time.sleep(.5);
            print("Trying again");
    return True;

params = { 'userId':userId,'route_id':routeId }
payload = { 'points' : [] }
fin=open(args.infile,'r');
headers=fin.readline();
count=0;
total=0;
sleepfor=0.0;
last=None;
lastpacket=time.time();
msg="None"
if args.speedup is not None:
    msg="%09.08f"%(1/args.speedup);
print("sending data at 1 second simtime = %s seconds realtime"%(msg));
for line in fin:
    values=[float(s) for s in line.split(',')];
    if last is None:
        last=values[0];
    payload['points'].append( {
                                'route_id':routeId,
                                'timestamp':values[0]*1000,
                                'accelerometer_x':values[3],
                                'accelerometer_y':values[4],
                                'accelerometer_z':values[5],
                                'latitude':0.0,
                                'longitude':0.0,
                                } )
    count+=1;total+=1;
    if count >= args.chunk_by:
        count=0;
        t=time.time();
        if args.verbose:
            sys.stdout.write("\r%09.08fs since last packet sent\r"%(t-lastpacket));
            sys.stdout.flush();
        lastpacket=t;
        push(url,params,payload);
        payload['points']=[]
        if args.speedup is not None:
            time.sleep(sleepfor);

    if args.speedup is not None:
        t=(values[0]-last)/(args.speedup);
        last=values[0];
        sleepfor+=t;
        #time.sleep(t);

push(url,params,payload);
print("Sent [n=] %d datapoints"%total)
print("Program Terminated")
