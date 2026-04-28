# 这是“学习讲解版”脚本。
# 它对应的主脚本是：TestNumpyStock.py
# 主脚本负责真正运行，这个 explained 脚本负责记录：
# 1. 主脚本现在在做什么
# 2. 每一行代码为什么这样写
# 3. 代码之间的关系是什么
# 4. 哪些写法是固定的，哪些是你可以改的
# 5. 你问过的问题，以及这些问题的解释
#
# 以后我们的固定节奏就是：
# 1. 你修改主脚本
# 2. 我帮你检查运行结果
# 3. 我把原理和你的疑问一起更新到这个 explained 脚本

# -------------------------------------------------------------------
# 一、当前主脚本整体在做什么？
# -------------------------------------------------------------------
# 现在的主脚本里有 2 个测试方法：
#
# 1. testReadFile
#    读取 demo.csv 里的第 3 列和第 7 列
#    然后把收盘价和成交量打印出来
#
# 2. testMaxAndMin
#    读取 demo.csv 里的第 5 列和第 6 列
#    然后计算最大值和最小值，再打印出来
#
# 所以现在这份脚本做的事情不是“预测股票涨跌”，
# 而是非常基础、非常重要的量化入门训练：
# 先把数据正确读出来，再做最简单的数字处理。

# -------------------------------------------------------------------
# 二、这次要特别记住的几个核心问题
# -------------------------------------------------------------------
# 疑问 1：
# “fname=file_name 里的 fname 是哪里来的？能不能改？”
#
# 回答：
# fname 来自 numpy 的 np.loadtxt() 函数。
# 它是这个函数事先规定好的参数名。
# 左边的 fname 一般不能乱改。
# 右边的 file_name 是你自己起的变量名，可以改。
#
# 疑问 2：
# “print 为什么可以这样写？书写规则是什么？”
#
# 回答：
# print 是 Python 自带的内置函数。
# 函数的基本写法是：
# 函数名(参数1, 参数2, ...)
#
# 所以：
# print(end_price)
# 的意思是：调用 print 这个函数，把 end_price 显示出来。
#
# 而：
# print("max_price={}".format(high_price.max()))
# 的意思是：
# 1. 先算出 high_price.max()
# 2. 再把结果填进 "max_price={}" 里的 {}
# 3. 最后再 print 打印整句话
#
# 疑问 3：
# “为什么终端里先显示 max_price 和 low_price，
# 后面又显示数组和点号？”
#
# 回答：
# 因为你现在有两个测试方法，不是一个。
# unittest 会把两个测试都运行。
# 它通常会按名字顺序执行：
# testMaxAndMin
# testReadFile
#
# 所以终端里会先看到：
# max_price=...
# low_price=...
#
# 再看到：
# 收盘价数组
# 成交量数组
#
# 最后的 .. 是 unittest 的进度标记。
# 一个点 . 表示一个测试通过。
# 你现在有两个测试，所以看到两个点。
#
# 疑问 4：
# “为什么现在推荐写 Path(__file__).with_name("demo.csv")，
# 不再直接写本地绝对路径？”
#
# 回答：
# 因为直接写本地绝对路径虽然在你自己电脑上能跑，
# 但会带来几个问题：
#
# 1. 换电脑就失效
# 2. 换文件夹就失效
# 3. 上传 GitHub 会暴露本地目录信息
# 4. 别人克隆你的仓库后无法直接运行
#
# 所以现在更推荐：
# Path(__file__).with_name("demo.csv")
#
# 这句话的意思是：
# “去找和当前这个 Python 文件放在同一个文件夹里的 demo.csv”
#
# 这样写更适合：
# - 本地学习
# - GitHub 公开上传
# - 后续接入 Vercel 展示项目

# -------------------------------------------------------------------
# 三、当前主脚本里的名字和函数，都是从哪里来的？
# -------------------------------------------------------------------
# 1. np
#    来自：import numpy as np
#    含义：给 numpy 起一个常用的小名字叫 np
#
# 2. unittest
#    来自：import unittest
#    含义：导入 Python 自带的测试模块
#
# 3. Path
#    来自：from pathlib import Path
#    含义：导入 Python 自带的路径工具
#
# 4. TestCase
#    来自：unittest.TestCase
#    含义：这是 unittest 里规定好的测试基类
#
# 5. loadtxt
#    来自：np.loadtxt
#    含义：numpy 提供的“读取文本数字文件”的函数
#
# 6. max
#    这里写成 high_price.max()
#    含义：numpy 数组对象自己的方法，作用是求最大值
#
# 7. min
#    这里写成 low_price.min()
#    含义：numpy 数组对象自己的方法，作用是求最小值
#
# 8. format
#    这里写成 "max_price={}".format(...)
#    含义：字符串自己的方法，作用是把值填进字符串模板里
#
# 9. print
#    Python 自带函数，负责把内容显示到终端
#
# 10. __name__
#     Python 自动提供的特殊变量
#
# 11. unittest.main
#     unittest 模块里的 main 函数
#     负责启动测试

# -------------------------------------------------------------------
# 四、哪些地方是固定写法？哪些地方不能乱改？
# -------------------------------------------------------------------
# 1. import、class、def、if
#    这些是 Python 的关键字，不能拼错。
#
# 2. unittest.TestCase
#    如果你继续用 unittest 写测试，通常就要这样写。
#
# 3. if __name__ == "__main__":
#    这是非常常见的固定写法，作用是“只有直接运行这个文件时才启动测试”。
#
# 4. unittest.main()
#    如果想让“直接运行文件”时自动执行测试，这一句通常要保留。
#
# 5. np.loadtxt(...) 里的参数名
#    fname
#    delimiter
#    usecols
#    unpack
#    encoding
#    这些左边的名字是函数规定好的，一般不能随便改。
#
# 6. 以 test 开头的方法名
#    如果你希望 unittest 自动识别它们是测试，
#    最好继续让方法名以 test 开头。

# -------------------------------------------------------------------
# 五、哪些地方是你自己可以改的？
# -------------------------------------------------------------------
# 1. 类名 TestNumpyStock 可以改
# 2. 变量名 file_name 可以改
# 3. 变量名 end_price、volume、high_price、low_price 可以改
# 4. usecols 里的列号可以改
# 5. print 里的文字可以改
# 6. 测试方法内部的读取逻辑以后可以继续扩展
#
# 但是要注意：
# 如果你改了变量名，后面所有使用这个变量的地方，也要一起改。
#
# 还要特别注意：
# 你虽然可以把 file_name 这个变量名改掉，
# 但 np.loadtxt(fname=...) 左边这个 fname 不要乱改。

import numpy as np  # 导入 numpy 库，并取常用外号 np
import unittest  # 导入 Python 自带的测试模块 unittest
from pathlib import Path  # 导入路径工具，方便安全地找到同目录数据文件


class TestNumpyStock(unittest.TestCase):  # 定义一个测试类，并让它继承 unittest.TestCase
    # 类和方法之间的关系：
    # 1. unittest.main() 启动测试系统
    # 2. 测试系统找到这个测试类
    # 3. 然后在类里寻找以 test 开头的方法
    # 4. 找到 testReadFile 和 testMaxAndMin
    # 5. 再依次运行它们

    def testReadFile(self):  # 读取 CSV 文件中的收盘价和成交量
        # Path(__file__) 的意思是“当前这个 Python 文件自己的路径”
        # .with_name("demo.csv") 的意思是“保持文件夹不变，只把文件名换成 demo.csv”
        # 所以这一句的整体意思是：
        # “找到和当前脚本放在同一个文件夹里的 demo.csv”
        file_name = Path(__file__).with_name("demo.csv")

        # 这一句的整体结构是：
        # end_price, volume = np.loadtxt(...)
        #
        # 解释：
        # 1. 右边 np.loadtxt(...) 先去读取文件
        # 2. 因为 unpack=True，所以它把两列拆开
        # 3. 第一列交给 end_price
        # 4. 第二列交给 volume
        end_price, volume = np.loadtxt(
            fname=file_name,  # fname 是固定参数名；file_name 是你自己的变量名
            delimiter=',',  # delimiter 是固定参数名；这里逗号表示 CSV 用逗号分列
            usecols=(2, 6),  # usecols 表示读取第 3 列和第 7 列，Python 从 0 开始数列号
            unpack=True,  # unpack=True 表示“把两列拆开”，这样左边才能接收两个结果
            encoding="utf-8-sig",  # 告诉程序按 utf-8-sig 方式读取文件，避免编码报错
        )

        # print(end_price) 的书写规则是：
        # 函数名(要打印的内容)
        #
        # 这里括号里放的是变量 end_price，
        # 所以 print 会把 end_price 当前保存的数据打印出来。
        print(end_price)

        # 这一句和上一句同理。
        # volume 是上面 loadtxt 读出来的第二列数据。
        print(volume)

    def testMaxAndMin(self):  # 读取最高价和最低价，再计算最大值和最小值
        # 这里仍然读取同一个 demo.csv，
        # 所以路径写法和上一个方法保持一致。
        file_name = Path(__file__).with_name("demo.csv")

        # 这里和上面的读法很像，只是改了 usecols：
        # usecols=(4, 5) 表示读取第 5 列和第 6 列
        #
        # 你把结果放进两个新变量里：
        # high_price 保存第 5 列
        # low_price 保存第 6 列
        high_price, low_price = np.loadtxt(
            fname=file_name,
            delimiter=',',
            usecols=(4, 5),
            unpack=True,
            encoding="utf-8-sig",
        )

        # 下面这一句是很值得学的一句：
        # print("max_price={}".format(high_price.max()))
        #
        # 我们把它拆成 4 小步：
        #
        # 第 1 步：high_price.max()
        # high_price 是 numpy 数组
        # .max() 是这个数组自带的方法，意思是“求这个数组里的最大值”
        #
        # 第 2 步："max_price={}"
        # 这是一个字符串，也就是一段文字
        # 里面的 {} 表示“这里留一个空位，等会儿把值填进来”
        #
        # 第 3 步："max_price={}".format(high_price.max())
        # .format(...) 是字符串的方法
        # 作用是：把括号里的值填进 {}
        #
        # 如果 high_price.max() 算出来是 13.44
        # 那这句最后会变成：
        # "max_price=13.44"
        #
        # 第 4 步：print(...)
        # 再把这句完整的话打印出来
        print("max_price={}".format(high_price.max()))

        # 这一句和上一句是同一个套路：
        # 1. low_price.min() 先算最小值
        # 2. "low_price={}" 提供文字模板
        # 3. .format(...) 把值填进去
        # 4. print(...) 打印最终结果
        print("low_price={}".format(low_price.min()))


# 下面这一组是“启动开关”：
#
# if __name__ == "__main__":
#     unittest.main()
#
# 关系是：
# 1. 你直接运行这个文件时，条件成立
# 2. 然后调用 unittest.main()
# 3. unittest 开始寻找测试类和测试方法
# 4. 找到 testMaxAndMin 和 testReadFile
# 5. 执行它们
# 6. 每通过一个测试，就显示一个点 .
#
# 所以你看到的终端输出，不只是 print 的结果，
# 还包括 unittest 自己打出来的测试进度和总结。
if __name__ == "__main__":  # 这是常见固定写法；表示“如果当前文件是直接运行的”
    unittest.main()  # 启动 unittest 测试系统
