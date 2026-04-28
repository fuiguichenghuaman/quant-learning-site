import numpy as np
import unittest
from pathlib import Path


class TestNumpyStock(unittest.TestCase):

#读取
##你现在是一名顶尖的代码专家，并且对代码有着透彻的理解，可以用最全面和最易懂的语言教会一个没有任何代码基础和计算机基础的小白理解和总结代码撰写的规则和原理以及代码之间的关系，和常用的关键技巧。并且你还是一个十分强大和时尚的设计师，你能通过互联网高度搜索来匹配我的需求。

    def testReadFile(self):
        file_name = Path(__file__).with_name("demo.csv")

        end_price,volume = np.loadtxt(
            fname=file_name,
            delimiter=',',
            usecols=(2,6),
            unpack=True,
            encoding="utf-8-sig",

        )
        print(end_price)
        print(volume)

#计算最大、最小值
    def testMaxAndMin(self):
        file_name = Path(__file__).with_name("demo.csv")
        high_price,low_price = np.loadtxt(
            fname=file_name,
            delimiter=',',
            usecols=(4,5),
            unpack=True,
            encoding="utf-8-sig",

        )
        print("max_price={}".format(high_price.max()))
        print("low_price={}".format(low_price.min()))

        
if __name__ == "__main__":
    unittest.main()
    
    
