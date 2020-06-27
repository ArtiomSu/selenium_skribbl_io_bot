#!/usr/bin/env bash
words="$(cat ./word_list.txt | sed "s/,/\n/g")"
cout="$(cat ./word_list.txt | sed "s/,/\n/g" | wc -l)"


echo -e "$words"
echo -e "\n\nnumber of words = $cout"
