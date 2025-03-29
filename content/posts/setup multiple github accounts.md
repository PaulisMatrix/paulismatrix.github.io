---
tags:
  - git
publish: true
date: 2024-08-20
description: how to maintain multiple github accounts on the same machine.
---

In case you want to do your personal and work tasks on the same machine.. 

We would be using ssh to authenticate with github. 

Quick overview of how ssh works : 

* You generate public and private keys by running `ssh-keygen -t rsa`
* Public keys are shared with other entities. You would be adding this key in the SSH and GPG keys 
section of your github account.
* Now whenever you clone or interact with git, these two keys are validated and you can work on your repo.

Every gitconfig of your account will be associated with a ssh _key pair_. In this case we would be generating two, 
for personal and work tasks. 

**Structure your directory for different profiles** : 

Assuming your directory structure looks like this 
```
~/
    |__.gitconfig
    |__work/
    |__personal/
```

Create two different gitconfig files, different for each directory. Like this
```
~/
|__.gitconfig
|__work/
    |_.gitconfig.work
|__personal/
    |_.gitconfig.personal
```

We will update the `.work` and `.personal` files later after generating the resp keys.

Note : Create `./ssh` dir in `$HOME` if not already. 

To add/modify ssh settings, create config file under this directory. `~/.ssh/config`

**Step1** : Generate the ssh keys for each.

```
ssh-keygen -t rsa -C "personal@email.com" -f "github-personal"
ssh-keygen -t rsa -C "work@email.com" -f "github-work"
```
`-C = comment and -f = filename storing the keys`

Leave passphrase/password empty. These are optional. Press enter after which the public and private keys will be generated. 

Those will look something like this generated under `~/.ssh`

```
github-personal
github-personal.pub 

github-work
github-work.pub
```

**Step2** : Add/Save these keys to the ssh-agent

```
ssh-add -K ~/.ssh/github-work
ssh-add -K ~/.ssh/github-personal
```
You can check your saved keys via `ssh-add -l`

**Step3** : Copy the public keys and paste in the SSH and GPG keys section in the respective
github account settings. 

```
pbcopy < ~/.ssh/github-work.pub
pbcopy < ~/.ssh/github-personal.pub
```

**Step4** : Modify the config file to configure separate keys for separate profiles.

Hopefully you have created a config file under `~/.ssh` as explained before.

```bash title="~/.ssh/config"
# work
Host github.com-github-work
    Hostname github.com
    User git
    IdentityFile ~/.ssh/github-work

# personal
Host github.com-github-personal
    Hostname github.com
    User git
    IdentityFile ~/.ssh/github-personal                                                                                       
```

**Step5** : Update the gitconfig files in each of the directory. 

Work :
```bash title="~/work/.gitconfig.work"
[user]
    email = work@email.com
    name = workypy
 
[github]
    user = "workypy" # your actual github username
 
[core]
    sshCommand = "ssh -i ~/.ssh/github-work"
```

Personal : 
```bash title="~/personal/.gitconfig.personal"
[user]
    email = personal@email.com
    name = personalpy
 
[github]
    user = "personalypy"
 
[core]
    sshCommand = "ssh -i ~/.ssh/github-personal"
```

**Step6** : Update your root .gitconfig file to tell git to use different configs for different directories.

```bash title="~/.gitconfig"
 
[includeIf "gitdir:~/work/"] # include for all .git projects under work/ 
path = ~/work/.gitconfig.work
 
[includeIf "gitdir:~/personal/"]
path = ~/personal/.gitconfig.personal
 
[core]
excludesfile = ~/.gitignore      # valid everywhere
```

**Step7** : Clone a repo using the **ssh** url and try push/pull/commit in each directory to verify correct credentials
are being used or not. You can also check via `git config --list`.


Fin. Enjoy hacking!