#!/bin/sh
# 互助码
# cron 30 22 * * 0,1 t_formatShareCode.sh

if [ -z "$LOG_PATH_PRIFIX" ]; then
    echo 请设置变量 LOG_PATH_PRIFIX 指定日志路径前缀
    echo Usage: export LOG_PATH_PRIFIX='/ql/log/repo_'
    echo Usage: export LOG_PATH_PRIFIX='/ql/log/repo/'
    exit 0
fi

allMsg=''
logDir="${LOG_PATH_PRIFIX}jd_get_share_code/";

cd $logDir
logFile=`ls -lt | grep '^-' | awk 'NR==1 {print $9}'`
echo "log file: $logFile"

function formatShareCode() {
    local title="************* format $1 $2 **************"
    echo $title

    local m1=`cat $logFile | awk -F'】' '/京东农场】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/farm \1\n#'`
    local m2=`cat $logFile | awk -F'】' '/京东萌宠】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/pet \1\n#'`
    local m3=`cat $logFile | awk -F'】' '/种豆得豆】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/bean \1\n#'`
    local m4=`cat $logFile | awk -F'】' '/东东工厂】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/ddfactory \1\n#'`
    local m5=`cat $logFile | awk -F'】' '/京喜工厂】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/jxfactory \1\n#'`
    local m6=`cat $logFile | awk -F'】' '/闪购盲盒】[A-z0-9=]+/ {print $2}' | sed -n "$1,$2p" | tr "\n" "&" | sed -r 's#^(.*)\&$#/sgmh \1\n#'`

    local msg="${m1}\n\n${m2}\n\n${m3}\n\n${m4}\n\n${m5}\n\n${m6}"
    allMsg="${allMsg}${title}\n${msg}\n\n\n"
    echo $msg
}

total=`echo $JD_COOKIE | awk -F'&' '{print NF}'`
count=$(($total/5 + 1))

for i in `seq 1 $count`; do 
    formatShareCode $(($i * 5 - 4)) $(($i * 5))
done

curl -X POST "http://www.pushplus.plus/send" \
    -H "Content-Type: application/json" \
    -d "{\"token\":\"$PUSH_PLUS_TOKEN\",\"title\":\"互助码\", \"content\":\"$allMsg\"}" \
    --compressed