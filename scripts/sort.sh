#!/usr/bin/env bash


sort_file="./word_list.txt"
#create backup
cp $sort_file ${sort_file}.bak

try_sort(){
cat ${sort_file}.bak | sed "s/,/\n/g" | sort -u | tr '\012' ',' | sed "s/,$//g" > $sort_file
}

while [ true ]; do
	try_sort
	if [ ! -s $sort_file ]; then
		echo "file is empty trying again"
		sleep 1
	else
		echo "file is sorted"
		rm ${sort_file}.bak
		break
	fi
done

