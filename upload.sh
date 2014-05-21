#!/bin/bash
rsync -avz --delete _site/ -e ssh manu@emmanueldurand.net:/var/www/website-manu/
