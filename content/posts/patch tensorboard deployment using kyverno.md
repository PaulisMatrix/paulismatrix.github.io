---
tags:
  - infra
publish: true
date: 2025-06-22
description: Patch tensorboard deployment requests to inject resource quotas using kyverno.
---

The tensorboard controller doesn't provide a way to configure resource quotas for tensorboard deployments. So if you have resourcequotas setup for your cluster, then tensorboard deployments will fail with the below error : 
```
4m56s       Warning   FailedCreate            replicaset/sample-v0214-55f5485c5b     

Error creating: pods "sample-v0214-55f5485c5b-mb2lz" is forbidden: failed quota: kf-resource-quota: must specify cpu for: tensorboard; memory for: tensorboard
```
One workaround is to dynamically patch the deployment requests received by the kube-api server using an [admission controller](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers).

We can use a policy engine named [kyverno](https://kyverno.io/docs/applying-policies/#in-clusters) which basically runs as a dynamic admission controller. 
It receives validating and  mutating admission webhook HTTP callbacks from kube api server and applies the matching policies to return the results that enforce admission policies or reject requests before those are registered with the cluster.


Following is the cluster wide policy we can use for patching tensorboard deployments : 

```yaml title="tensorboard-default-resources.yaml"
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: inject-tensorboard-defaults
  annotations:
    policies.kyverno.io/title: TensorBoard Default Resources
    policies.kyverno.io/category: Kubeflow
    policies.kyverno.io/severity: medium
spec:
  validationFailureAction: enforce
  background: true
  rules:
  - name: inject-default-resources
    match:
      any:
      - resources:
          kinds:
          - tensorboard.kubeflow.org/v1alpha1/Tensorboard
          namespaces:
          - sample-ns
    preconditions:
      any:
      - key: "{{ request.operation }}"
        operator: In
        value: ["CREATE", "UPDATE"]
    mutate:
      patchStrategicMerge:
        spec:
          resources:
            requests:
              +(cpu): "500m"
              +(memory): "1Gi"
            limits:
              +(cpu): "1"
              +(memory): "2Gi"
```
Make sure to add the full tensorboard deployment name(API Version + Kind) under resources/kinds.

Kyverno basically listens for new tensboard deployments and applies this policy which injects cpu and memory requests if all the conditions in `match` argument are succesfully validated. 

Check the logs of kyverno admission contoller whether it was able to succesfully patch the requests or not. 
If you see such similar logs : 
```
INF github.com/kyverno/kyverno/pkg/auth/auth.go:83 > 
disallowed operation evaluationError= gvr="tensorboard.kubeflow.org/v1alpha1, Resource=tensorboards" kind=Tensorboard logger=auth namespace= reason= v=0 verb=get
```
then it means the request is blocked due to lack of permission and we need to update the kyverno clusterole : 
```yaml
kubectl patch clusterrole kyverno:admission-controller:core --type=json -p='[
  {
    "op": "add",
    "path": "/rules/-",
    "value": {
      "apiGroups": ["tensorboard.kubeflow.org"],
      "resources": ["tensorboards"],
      "verbs": ["get", "list", "watch", "update", "patch"]
    }
  }
]'
```
and then restart the admission controller deployment.
Describe the tensorboard pod to check whether you see the resource requests/limits or not.
