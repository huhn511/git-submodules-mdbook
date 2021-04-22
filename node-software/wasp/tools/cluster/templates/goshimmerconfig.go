package templates

type GoshimmerConfigParams struct {
	ApiPort int
}

const GoshimmerConfig = `
{
  "analysis": {
    "client": {
      "serverAddress": "node1.goshimmer.dev:188"
    },
    "server": {
      "bindAddress": "0.0.0.0:16178"
    },
    "dashboard": {
      "bindAddress": "0.0.0.0:80",
      "dev": true
    }
  },
  "autopeering": {
    "entryNodes": [
      "2PV5487xMw5rasGBXXWeqSi4hLz7r19YBt8Y1TGAsQbj@ressims.iota.cafe:15626"
    ],
    "port": 14626
  },
  "dashboard": {
    "bindAddress": "127.0.0.1:8081",
    "dev": false,
    "basic_auth": {
      "enabled": false,
      "username": "goshimmer",
      "password": "goshimmer"
    }
  },
  "database": {
    "inMemory": true,
    "directory": "mainnetdb"
  },
  "drng": {
    "pollen": {
      "instanceId": 1,
      "threshold": 3,
      "distributedPubKey": "",
      "committeeMembers": [
        "AheLpbhRs1XZsRF8t8VBwuyQh9mqPHXQvthV5rsHytDG",
        "FZ28bSTidszUBn8TTCAT9X1nVMwFNnoYBmZ1xfafez2z",
        "GT3UxryW4rA9RN9ojnMGmZgE2wP7psagQxgVdA4B9L1P",
        "4pB5boPvvk2o5MbMySDhqsmC2CtUdXyotPPEpb7YQPD7",
        "64wCsTZpmKjRVHtBKXiFojw7uw3GszumfvC4kHdWsHga"
      ]
    },
    "xteam": {
      "instanceId": 1339,
      "threshold": 4,
      "distributedPubKey": "",
      "committeeMembers": [
        "GUdTwLDb6t6vZ7X5XzEnjFNDEVPteU7tVQ9nzKLfPjdo",
        "68vNzBFE9HpmWLb2x4599AUUQNuimuhwn3XahTZZYUHt",
        "Dc9n3JxYecaX3gpxVnWb4jS3KVz1K1SgSK1KpV1dzqT1",
        "75g6r4tqGZhrgpDYZyZxVje1Qo54ezFYkCw94ELTLhPs",
        "CN1XLXLHT9hv7fy3qNhpgNMD6uoHFkHtaNNKyNVCKybf",
        "7SmttyqrKMkLo5NPYaiFoHs8LE6s7oCoWCQaZhui8m16",
        "CypSmrHpTe3WQmCw54KP91F5gTmrQEL7EmTX38YStFXx"
      ]
    },
    "custom": {
      "instanceId": 9999,
      "threshold": 3,
      "distributedPubKey": "",
      "committeeMembers": []
    }
  },
  "fpc": {
    "bindAddress": "0.0.0.0:10895"
  },
  "gossip": {
    "port": 14666,
    "ageThreshold": "5s",
    "tipsBroadcaster": {
      "interval": "10s"
    }
  },
  "logger": {
    "level": "info",
    "disableCaller": false,
    "disableStacktrace": false,
    "encoding": "console",
    "outputPaths": [
      "stdout",
      "goshimmer.log"
    ],
    "disableEvents": true,
    "remotelog": {
      "serverAddress": "remotelog.goshimmer.iota.cafe:5213"
    }
  },
  "metrics": {
    "local": true,
    "global": false
  },
  "network": {
    "bindAddress": "0.0.0.0",
    "externalAddress": "auto"
  },
  "node": {
    "disablePlugins": ["Autopeering", "PortCheck"],
    "enablePlugins": []
  },
  "pow": {
    "difficulty": 22,
    "numThreads": 1,
    "timeout": "1m"
  },
  "profiling": {
    "bindAddress": "127.0.0.1:6061"
  },
  "prometheus": {
    "bindAddress": "127.0.0.1:9311"
  },
  "webapi": {
    "auth": {
      "password": "goshimmer",
      "privateKey": "",
      "username": "goshimmer"
    },
    "bindAddress": "127.0.0.1:{{.ApiPort}}"
  },
  "networkdelay": {
    "originPublicKey": "9DB3j9cWYSuEEtkvanrzqkzCQMdH1FGv3TawJdVbDxkd"
  },
  "waspconn": {
    "port": 5000,
    "utxodbenabled": true,
    "utxodbconfirmseconds": 0,
    "utxodbconfirmrandomize": false,
    "utxodbconfirmfirst": true
  }
}
`
