#!/bin/sh
# cron 0 9 * * * t_checkDeps.sh

log_dir=/ql/log
allMsg=''

for dir in `ls $log_dir`:
do
    if [ -d $log_dir/$dir ]; then
        msg=`cat $log_dir/$dir/* | grep -E 'ModuleNotFoundError|Cannot find module' | uniq -c`
        if [ -n "$msg" ]; then
            allMsg="${allMsg}\n${msg}"
        fi
    fi
done

echo $allMsg

if [ -n "$allMsg" ]; then
    curl -X POST "http://www.pushplus.plus/send" \
        -H "Content-Type: application/json" \
        -d "{\"token\":\"$PUSH_PLUS_TOKEN\",\"title\":\"检查依赖\", \"content\":\"$allMsg\"}" \
        --compressed
fi