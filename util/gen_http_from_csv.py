import requests
import json
import argparse
import time

parser=argparse.ArgumentParser(description='Generate HTTP GET traffic on 8080 from csv file');
parser.add_argument('infile')
parser.add_argument('--realtime',action='store_true')
parser.add_argument('--chunk-by',type=int,default=10)
args=parser.parse_args()

routeId=None;
userId=None;

#rid_query = 'localhost:8080/newroute'
routeId=7;
userId=1;

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
last=None
for line in fin:
    values=[float(s) for s in line.split(',')];
    if last is None:
        last=values[0];
    payload['points'].append( {
                                'route_id':routeId,
                                'timestamp':values[0],
                                'accelerometer_x':values[3],
                                'accelerometer_y':values[4],
                                'accelerometer_z':values[5],
                                'latitude':0.0,
                                'longitude':0.0,
                                } )
    count+=1;total+=1;
    if count >= args.chunk_by:
        count=0;
        push(url,params,payload);
        payload['points']=[]

    if args.realtime:
        t=values[0]-last;
        last=values[0];
        time.sleep(t);

push(url,params,payload);
print("Sent [n=] %d datapoints"%total)
print("Program Terminated")
