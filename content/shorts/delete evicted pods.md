---
tags:
  - infra
publish: true
date: 2025-10-25
description: Delete evicted/failed k8s pods. 
---

Yes, you don't need to manually delete evicted pods, kubernetes takes care by itself.

A failed/evicted pod isn't running and doesn't take up any node resources. But it retains an
important resource, its IP address. 

Too many evicted pods which are just lying around might exhaust node's IP pool as a result 
of which new pods might not get scheduled properly cause the CNI doesn't have IPs to give to the new 
pods until the evicted pods are cleaned up. 


```
Quick refreshal on Container Network Inteface(CNI)

When a new pod is scheduled to a Node :

* The kubelet on that node creates the container.
* Kubelet calls CNI plugin (eg: Cilium) which
-- Creates a network namespace for the pod.
-- Assigns the pod a unique IP address.
-- Connects pod's interface to the node's network. 
* K8s then adds this pod's IP to the cluster network so its reachable.
```

Cleanup Cmd : `k delete pod --field-selector=status.phase=Failed`

Add -A if you're feeling brave. 

You can configure automatic cleanup through [kube-controller-manager's](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/) GC settings : 

`--terminated-pod-gc-threshold int32 Default: 12500`
> Number of terminated pods that can exist before the terminated pod garbage collector kicks in and starts deleting terminated pods. If <= 0, the terminated pod garbage collector is disabled.

Another way is to use the [Descheduler](https://github.com/kubernetes-sigs/descheduler) for kubernetes. 

