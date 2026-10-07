# 首页的绘本页

首页封面往下是一本绘本：长文、项目、我觉得、关于，一栏一页。每页是和封面一样的米白纸，小人在做这一栏的事，身后晕开一块这一页颜色的水彩，里面透出一点场景；旁边是这一栏的几条内容和进入列表的链接，字都在纸上。

代码在 `components/home-sketch/storybook.tsx`（每一页）、`storybook-page.tsx`（滚动时让画轻轻漂）、`storybook-drawings.ts`（画，脚本生成的，别手改）。

## 加一栏的顺序

1. **先写素的。** 栏目自己的列表页先做好，首页这一页先只有标题、一句话、几条内容和「全部 →」，背景先用一种纯色。内容定下来再画。
2. **让 ChatGPT 画小人的线稿。** 在同一个对话里接着画，人物才对得上；新开对话的话，先上传 `scripts/storybook/art/writer.png`（或者右下角小人的截图）当参考。提示词照这个写：

   > Same character, same style as before (same head, hair, big round glasses, face, t-shirt, trousers and shoes). Scene for my "XX" page: ……. Black ink line art only on pure white, no fills, no shading, no text, uniform line weight. Square, centred, generous margin.

   一次画两张让人挑。只要黑线白底，别让它上色，上色我们自己来。
3. **身后那块水彩和场景。** 再让它画一张这一页的整幅背景线稿（"BACKGROUND only, no character, wide landscape format"），只取小人身后的一小块：在 `storybook.tsx` 里给这一页写一个 `Patch`，`shape` 是一块不规则的水彩形状，`washes` 是几层颜色（外圈更淡的晕、一两块深浅、几点溅出来的颜料），`scene` 是背景线稿，`place` 决定它在小人身后哪个位置（可以用负的 scale 左右翻过来）。线稿会被那块水彩的形状遮住、边缘淡掉，不会跑到字底下。背景线稿放在 `scripts/storybook/art/backgrounds/`。
   要再加点什么，就让它单独画小贴纸（风筝、风车、蘑菇），一张一样，自己摆。
4. **存下来。** Chrome 只让网页自动下载一次，后面会拦。用图下面的「Copy image」，再在终端里把剪贴板存成文件：

   ```bash
   osascript -e 'set f to open for access POSIX file "/tmp/x.png" with write permission' -e 'set eof f to 0' -e 'write (the clipboard as «class PNGf») to f' -e 'close access f'
   ```

5. **分区、定颜色。**

   ```bash
   python3 scripts/storybook/trace.py label /tmp/x.png
   ```

   生成 `x-labels.png`，每块封闭区域有一个编号。照着它写 `scripts/storybook/art/<名字>.json`，参考已有的几份：

   - `fills`：颜色 → 区域编号。没写到的区域一律是纸色，所以脸和手不会透出背景色。
   - `clear`：要透明的区域，比如两腿之间的空隙。
   - `under`：线没有围起来、但想上色的地方（湖面、草地），画在线稿下面，坐标是图片自己的（y 朝下）。
   - `cheeks`：脸颊的两团黄色。

   同一个颜色只写一次，把编号都放进同一个列表里（JSON 里重复的 key 会互相覆盖）。

   用过的颜色：纸 `#f8f4ea`、头发高光 `#cfcac2`、上衣 `#f1b98a`、裤子 `#6f8299`、鞋 `#c8503c`，其余见几份 json。

6. **描线、生成。** 把原图转成黑白存进 `scripts/storybook/art/<名字>.png`（1 位色，十几 KB），然后

   ```bash
   python3 scripts/storybook/trace.py build scripts/storybook/art/<名字>.png scripts/storybook/art/<名字>.json NAME
   ```

   把输出贴进 `storybook-drawings.ts`。需要 `brew install potrace`，Python 要有 numpy、scipy、pillow。

7. **放进页面。** 在 `storybook.tsx` 里照已有的几页加一个 `XxxPage`：`BookPage` 用纸色，`Art` 放画和它的 `patch`（`view` 是 viewBox，四周要给水彩留出地方）。电脑上画和文字左右交替，用 `flip`。
8. **看一眼。** `npm run dev`，电脑宽 1280、手机宽 390 都截图看：字不能压在画上，没有横向滚动，脸不能透出背景色。然后 `npm run build`、`npm run lint`。

## 为什么这么做

试过在代码里手写坐标画小人的身体，比例和动作都不对，看着粗糙。人物交给图像模型画线稿，代码只负责描线、上色和排版，这样画得好，又能保持同一套线条和颜色。

也试过整页铺满颜色、再把整幅背景叠在小人后面：太满，线从字底下穿过，手机上又被裁掉一半。现在整页是纸，只在小人身后一块水彩里露一点场景，安静，字也清楚。
