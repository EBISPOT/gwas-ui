#!/bin/sh

# Author : Abayomi Mosaku
# Copyright (c) ebi.ac.uk

# Ensure all branches ready for release are merged into dev branch

DEV_BRANCH='goci-977-Google-Analytics-release'
MASTER_BRANCH='master'
DOCUMENTATION_BRANCH='documentation'

echo "What is the new version number ?"
read VERSION_NUMBER
echo "Initializing Software Release for version $VERSION_NUMBER"

# Check out documentation, merge documentation branch back into dev branch.
git checkout $DOCUMENTATION_BRANCH
git pull origin $DOCUMENTATION_BRANCH

# switch to dev branch, pull changes from remote dev branch, integrate contents of documentation branch to dev branch
git checkout $DEV_BRANCH
git pull origin $DEV_BRANCH
git merge $DOCUMENTATION_BRANCH
git push origin $DEV_BRANCH

# switch to master branch, pull changes from remote master branch, integrate contents of dev branch with master branch
git checkout $MASTER_BRANCH
git pull origin $MASTER_BRANCH
git merge $DEV_BRANCH

# compile to ensure evrything is still as expected
if mvn clean compile; then
    echo "compilation was successful"
else
    echo "compilation failed"
    exit;
fi

# Create a new temporary branch for release
git checkout -b release-branch

# run the version number upgrade script
./update-version.sh -v $VERSION_NUMBER

# Ensure everything still builds
if mvn clean compile; then
    echo "compilation was successful after version number update"
else
    echo "compilation failed after version number update"
    exit;
fi
git commit -a -m  "$VERSION_NUMBER:  Release done"

# CREATE A NEW TAG AND PUSH TO REMOTE MASTER.
git tag -a $VERSION_NUMBER -m "$VERSION_NUMBER tag"
git push origin --tags $MASTER_BRANCH

# Check out documentation , merge the release branch back into documentation.
git checkout $DOCUMENTATION_BRANCH
git merge release-branch
git push origin $DOCUMENTATION_BRANCH

# Check out dev , merge the documentation branch back into dev.
git checkout $DEV_BRANCH
git merge $DOCUMENTATION_BRANCH
git push origin $DEV_BRANCH

# Check out master, Merge dev back to master
git checkout $MASTER_BRANCH
git merge $DEV_BRANCH
git push origin $MASTER_BRANCH

# then delete the unnecessary temporary branch
git branch -d release-branch