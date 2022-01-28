#!/bin/sh
# 非工作日 返回状态码 -1

day=`date +%Y%m%d`
day='20220127'

summary=`curl -s https://www.shuyz.com/githubfiles/china-holiday-calender/master/holidayCal.ics \
    | awk -F"BEGIN:VEVENT" -vOFS="\n\n\n" '{ for( i=1; i<=NF; i++) print $i}' \
    | grep -EA11 "^DTSTART.*:${day}.*" | grep -E 'SUMMARY:' \
    | awk -F":" '{print $2}'`

if [ -n "`echo $summary | grep 假期`" ]; then
    echo $day $summary
    exit -1
else
    echo 工作日 $summary
fi
