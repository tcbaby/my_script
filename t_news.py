#!/usr/bin/env python3
# -*- coding: utf-8 -*

'''
早报
早报地址：https://www.163.com/dy/media/T1603594732083.html
cron 20 8 * * * t_news.py
'''

import requests
from lxml import etree

def main():
    url="https://www.163.com/dy/media/T1603594732083.html"
    rsp=requests.get(url)
    html=etree.HTML(rsp.text)
    today_url=html.xpath("//h2[@class='media_article_title']/a/@href")[0]
    rsp=requests.get(today_url)
    html=etree.HTML(rsp.text)
    news_list=html.xpath("//div[@class='post_body']/p[2]//text()")
    news_list=news_list[1:]

    news="\n".join(str(i) for i in news_list)
    print(news)
    try:
        from sendNotify import send
        send("早报", news)
    except:
        print("加载通知服务失败~")


if __name__ == "__main__":
    main()
