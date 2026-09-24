# 来处 · 插画提示词

每一章一张（以后可以几张轮播）海报，像游戏主界面。做法是**素材 + 海报排版**，不是整张生成：每个地标单独生成，自己的细节必须对；摆在哪、多大，按画面好看来，不按地图。

流程：

1. `scripts/gen-life-asset.sh <name> art/life/prompts/<name>.txt [参考照片...]`：Codex 出图，透明背景，放在 `art/life/raw/assets/`
2. `python3 scripts/cutout-life-asset.py <name>`：没有透明背景就抠图，放大 2 倍，裁边，输出到 `art/life/assets/`
3. 在 `art/life/posters/<chapter>.json` 里排版（按 sky / far / tower / island / near / front 分层）
4. `python3 scripts/bake-life-poster.py <chapter>`：每层合成一张 2560 宽的图，输出到 `public/life/<chapter>/`，页面再加上视差、湖面倒影、云和柳絮的动画

参考照片放在 `art/life/ref/`（来自维基共享资源，只当参考用，不进 git，也不上线）。原图和参考图都在 `.gitignore` 里。

## 共用风格

每张提示词都以这段开头，保证整套画风一致：

> Anime game key art background, in the style of high-end gacha game splash art such as Genshin Impact, Zenless Zone Zero and Reverse: 1999. Painterly cel-shaded background art with crisp clean shapes and rich fine detail. A luminous, bright sunny day: clear saturated blue sky, big sculpted cumulus clouds, warm sunlight with soft bloom and gentle light rays, vivid fresh greens, clean atmospheric perspective. Cinematic wide composition from a high elevated three-quarter aerial view looking down. Youthful, nostalgic, joyful mood. No text, no letters, no logos, no watermark, no UI, no characters in the foreground (tiny distant figures and bicycles are fine). Keep the lower-left area calm (water, lawn or shade) so a title can sit there.

## 北京 · 燕园与清华

燕园海报「一塔湖图」已完成：博雅塔、图书馆、湖心岛和鲁斯亭、石舫、远岸、近岸、垂柳、天空，每个素材的提示词在 `art/life/prompts/`。下表是早先整张生成时写的，其余几处换成素材做法时再用。

| 文件 | 地方 | 画面 |
| --- | --- | --- |
| `beijing-weiming` | 未名湖 | Peking University campus, Weiming Lake seen from above: the thirteen-tiered grey brick Boya Pagoda standing on a small wooded hill on the east shore, its reflection in the calm jade-green lake; a small round island with a red-pillared pavilion; a white marble stone boat moored by the shore; weeping willows along winding stone banks; traditional Chinese buildings with grey tiled roofs and red walls peeking through dense trees; the city and the Western Hills hazy in the far distance. |
| `beijing-library` | 北大图书馆 | Peking University Library seen from above: a large traditional-style Chinese building with sweeping grey tiled hip roofs and white walls, a wide plaza and lawn in front, rows of tall trees, students walking and cycling, parked bicycles, bright summer sun. |
| `beijing-zhongguancun-north` | 中关村北大街 | The avenue between Peking University and Tsinghua University, seen from above: a wide tree-lined city street, shared bicycles along the pavement, a red city bus, a pedestrian overpass, campus walls and trees on both sides, glass office towers in the distance, crisp afternoon sunlight. |
| `beijing-zhongguancun` | 中关村商业区 | Zhongguancun tech and shopping district in Haidian from above: modern glass towers, giant outdoor screens, busy plazas and footbridges, colourful shopfronts, trees, a subway entrance, lively and futuristic urban energy in bright afternoon sun. |
| `beijing-tsinghua-gate` | 清华二校门 | Tsinghua University's Second Gate from above: an elegant white classical gate with columns and an arch (the inscription left soft and unreadable) on a broad avenue lined with tall trees, lawns and old red-brick campus buildings, students with bicycles, summer sunlight through the leaves. |

清华 C 楼等你描述长什么样再补。
