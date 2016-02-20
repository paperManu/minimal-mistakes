#!/bin/bash
jekyll build
rsync -avz _site/ -e ssh manu@emmanueldurand.net:/var/www/website-manu/
