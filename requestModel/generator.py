#!/usr/bin/python
# -*- coding: utf-8 -*-

import os, json, requests, threading, time, sys, train, requests.packages.urllib3
from dotenv import load_dotenv
load_dotenv(dotenv_path='../.env')

ReplicasAPI = "https://{}:6443/apis/extensions/v1beta1/namespaces/s3-portal/deployments/api-deploy/scale".format(os.getenv("K8S_MASTER_IP"))
API = {
  "url": "http://{}:30080/api/v1/auth/login".format(os.getenv("K8S_MASTER_IP")),
  "params": { "email": "cijie@imac.com", "password": "123456" }
}
request_success = 0
request_failed = 0
used_time = 0

requests.packages.urllib3.disable_warnings()

# 將讀取檔案依照時間(time)進行排序，並覆蓋原先檔案。
def sort(fileName):
  with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "r") as reader:
    data = json.loads(reader.read())
    data.sort(key = lambda x:x['time'], reverse = False)
    with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "w") as writer:
      writer.write(json.dumps(data, sort_keys = True, indent = 2, separators=(',', ': ')))
  
# 取得尚未測試之使用者流量資料，利用服務副本數量進行判斷。
def getStartPoint():
  result = list()
  r = os.popen("ls {}".format(os.getenv("TANET_OUTPUT_PATH")))
  info = r.readlines()
  for line in info:
    fileName = line.split('\n')[0]
    with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "r") as reader:
      sort(fileName)
      data = json.loads(reader.read())
      for item in data:
        if item["replicas"]["count"] == 0:
          return json.dumps({ 'fileName': fileName, 'data': item }, sort_keys = True, indent = 2, separators=(',', ': '))

# 發出使用者請求
def sendRequest():
  global request_success
  global request_failed
  global used_time
  try:
    start_time = time.time()
    response = requests.post(API["url"], data = API["params"])
    end_time = time.time()
    used_time += end_time - start_time
    if (response.status_code == 200):
      request_success += 1
    else:
      request_failed += 1
  except:
    request_failed += 1

# 設定服務副本數量
def setReplicas(count):
  headers = {
    "Authorization": "Bearer {}".format(os.getenv("K8S_TOKEN")),
    "Content-Type": "application/yaml"
  }
  body = (requests.get(ReplicasAPI, headers = headers, verify=False)).json()
  body["spec"]["replicas"] = count
  requests.put(ReplicasAPI, headers = headers, data = json.dumps(body), verify=False)
  print 'Update Replicas: {}'.format(count)

# 取得當前服務副本數量
def getPods():
  pods = os.popen('kubectl get pods -o=name -n s3-portal | grep api').read()
  return len(pods.split( ))

# 初始化全域變數
def init():
  global request_success
  global request_failed
  global used_time
  request_success = 0
  request_failed = 0
  used_time = 0

# 將結果寫入至原先檔案
def writeFile(fileName, info):
  with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "r") as reader:
    data = json.loads(reader.read())
    info = json.loads(info)
    for item in data:
      if item["time"] == info["file_data"]["data"]["time"]:
        item["replicas"]["count"] = info["test_data"]["pod_count"]
        item["request"]["error"] = info["test_data"]["failed_req"]
        break
    with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "w") as writer:
      writer.write(json.dumps(data, sort_keys = True, indent = 2, separators=(',', ': ')))

# 程式進入點
def main():
  sys.setrecursionlimit(200000)
  start_point = json.loads(getStartPoint())
  print 'Start file name: {}, date: {}'.format(start_point["fileName"], start_point["data"]["time"])
  print 'Start time: {}'.format(time.time())
  if start_point["data"]["replicas"]["prediction"] != 0:
    setReplicas(start_point["data"]["replicas"]["prediction"])
  request_count = start_point["data"]["request"]["count"]
  delay = 60.0 / request_count
  for i in range(request_count):
    thread = threading.Thread(target = sendRequest, name = 'Thread-{}'.format(i))
    thread.start()
    time.sleep(delay)
  for th in threading.enumerate():
    if th != threading.current_thread():
      th.join()
  res = json.dumps({
    "file_data": start_point,
    "test_data": {
        "avg_used_time": used_time / request_count,
        "success_req": request_success,
        "failed_req": request_failed,
        "pod_count": getPods()
      }
    }, sort_keys = True, indent = 2, separators=(',', ': '))
  print res
  writeFile(start_point["fileName"], res)
  init()
  if start_point["data"]["time"] == 1439:
    train.lstm(start_point["fileName"])
  main()

if __name__ == '__main__':
  main()