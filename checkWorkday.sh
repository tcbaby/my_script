#!/bin/sh
# 非工作日 返回状态码 -1

day=`date +%Y%m%d`
day=20220207

summary=`curl -s https://www.shuyz.com/githubfiles/china-holiday-calender/master/holidayCal.ics \
    | awk -F"BEGIN:VEVENT" -vOFS="\n\n\n" '{ for( i=1; i<=NF; i++) print $i}' \
    | grep -EA11 "^DTSTART.*:${day}.*" \
    | awk -F":" '/SUMMARY:/ {print $2}'`

if [[ $summary =~ .*假期.* ]]; then
    echo $day 非工作日 $summary
    exit -1
else
    echo $day 工作日 $summary
fi
