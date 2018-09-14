#!/usr/bin/python
# -*- coding: utf-8 -*-

import json, numpy, math, os
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from keras.models import Sequential
from keras.models import load_model
from keras.layers import LSTM
from keras.layers import Dense
from dotenv import load_dotenv

load_dotenv(dotenv_path='../.env')
look_back = 1

# 建立訓練資料集與測試資料集
def create_dataset(dataset, look_back = 0):
  dataX, dataY = [], []
  for i in range(len(dataset) - look_back - 1):
    dataX.append(dataset[i : (i + look_back), 0])
    dataY.append(dataset[i + look_back, 0])
  return numpy.array(dataX), numpy.array(dataY)

# 確認權重參數是否存在
def existModel():
  r = os.popen("ls model.h5")
  if len(r.readlines()) == 0:
    return False
  else:
    return True

# 資料前處理與模型訓練
def train(fileName):
  dataset = list()
  with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "r") as reader:
    data = json.loads(reader.read())
    for item in data:
      item_array = list()
      item_array.append(item["replicas"]["count"])
      dataset.append(item_array)
    scaler = MinMaxScaler(feature_range = (0, 1))
    dataset = scaler.fit_transform(dataset)
    train = dataset[0 : int(len(dataset)), :]
    trainX, trainY = create_dataset(train, look_back)
    trainX = numpy.reshape(trainX, (trainX.shape[0], 1, trainX.shape[1]))
    if existModel() == False:
      model = Sequential()
      model.add(LSTM(4, input_shape = (1, look_back)))
      model.add(Dense(1))
      model.compile(loss = 'mean_squared_error', optimizer = 'adam')
      model.fit(trainX, trainY, epochs = 10, batch_size = 1, verbose = 2)
    else:
      model = load_model('model.h5')
      model.fit(trainX, trainY, epochs = 10, batch_size = 1, verbose = 2)
    trainPredict = model.predict(trainX)
    trainPredict = scaler.inverse_transform(trainPredict)
    trainY = scaler.inverse_transform([trainY])
    trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:,0]))
    print('Train Score: %.2f RMSE' % (trainScore))
    trainPredictPlot = numpy.empty_like(dataset)
    trainPredictPlot[:, :] = 0
    trainPredictPlot[look_back: len(trainPredict) + look_back, :] = trainPredict
    model.save('model.h5')
    return trainPredictPlot

# 取得下一個檔案名稱
def nextFile(fileName):
  fileList = list()
  r = os.popen("ls {}".format(os.getenv("TANET_OUTPUT_PATH")))
  for file in r.readlines():
    fileList.append(file.split("\n")[0])
  index = fileList.index(fileName)
  return fileList[index + 1]

# 將結果寫入至原先檔案
def writeFile(fileName, predicateData):
  with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "r") as reader:
    data = json.loads(reader.read())
    for index in range(len(data)):
      data[index]["replicas"]["prediction"] = round(predicateData[index][0]) 
    with open("{}{}".format(os.getenv("TANET_OUTPUT_PATH"), fileName), "w") as writer:
      writer.write(json.dumps(data, sort_keys = True, indent = 2, separators=(',', ': ')))

# LSTM 模型訓練  
def lstm(fileName):
  predicateData = train(fileName)
  nextFileName = nextFile(fileName)
  writeFile(nextFileName, predicateData)