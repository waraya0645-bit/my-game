// Deploy Preview test
const config = {
    type: Phaser.AUTO,
    width: 1152,
    height: 648,
    parent: 'game',
    backgroundColor: '#000000',

    pixelArt: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', './images/IMG_0410.png');
    this.load.image('whiteCircle', './images/white_circle.png');
    this.load.image('blackCircle', './images/black_circle.png');
    this.load.image('0', './images/black.png');
    this.load.image('1', './images/floor.png');
    this.load.image('100', './images/stone_wall.png');

    this.load.image('200', './images/dot-Mygame_20261009081021.png');
}

function create() {
    // レイヤー管理
this.layers = {
    floor: [],
    wallCollision: [],
    wallVisual: [],
    decorationCollision: [],
    decorationVisual: []
};
    this.mapOffsetY = 4;
    const tileSize = 64;
    // オブジェクトの配置
    this.objects = [
        {
        tileX: 12,tileY: 4.5,image: '200',
        hitboxWidth: 31,hitboxHeight: 30
        },
    ];
    this.mapData = [
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
// ================================
// 独立した5つのマップデータ
// 現在のマップサイズ：横18マス、縦10マス
// ================================

const makeMap = (defaultValue) =>
    Array.from(
        { length: 10 },
        () => Array(18).fill(defaultValue)
    );

// 1. 床の見た目：タイル番号
this.floorMapData = makeMap(0);
this.floorMapData[2][3] = 1;    // そのマスに床タイル1
this.floorMapData[2][4] = null; // そのマスの床を表示しない
// 2. 壁の当たり判定：trueなら通行不可
this.wallCollisionMapData = makeMap(false);

// 3. 壁の見た目：タイル番号。nullなら透明
this.wallVisualMapData = makeMap(null);

// 4. 装飾物の当たり判定：nullなら判定なし
this.decorationCollisionMapData = makeMap(null);

// 5. 装飾物の見た目：画像キー。nullなら画像なし
this.decorationVisualMapData = makeMap(null);

// ================================
// マップ設定例
// [行][列]で指定。番号は0から数える。
// ================================

// 通常の壁：見た目も判定もあり
this.wallCollisionMapData[4][5] = true;
this.wallVisualMapData[4][5] = 100;

// 透明な壁にする場合：判定だけあり
// this.wallCollisionMapData[2][3] = true;

// 見た目だけの壁：判定なし
// this.wallVisualMapData[2][4] = 100;

// 画像だけある装飾物
this.decorationVisualMapData[5][4] = '200';

// 判定だけある装飾物
this.decorationCollisionMapData[6][4] = {
    width: 31,
    height: 30
};

// ================================
// 1. 床の見た目を描画
// ================================

for (let y = 0; y < this.floorMapData.length; y++) {
    for (let x = 0; x < this.floorMapData[y].length; x++) {
        const tile = this.floorMapData[y][x];

        // nullなら何も描画しない
        if (tile === null) {
            continue;
        }

        const floorImage = this.add.image(
            x * tileSize + 32,
            y * tileSize + 32 + this.mapOffsetY,
            String(tile)
        );

        this.layers.floor.push(floorImage);
    }
}

// 壁の当たり判定レイヤー
// true = 通行不可、false = 通行可能
this.layers.wallCollision = this.mapData.map(row =>
    row.map(tile => tile >= 100 && tile < 200)
);

// ================================
// 2. 壁を描画
// ================================

for (let y = 0; y < this.mapData.length; y++) {
    for (let x = 0; x < this.mapData[y].length; x++) {
        const tile = this.mapData[y][x];

        if (tile < 100 || tile >= 200) continue;

        const wall = this.add.image(
            x * tileSize + 32,
            y * tileSize + 32 + this.mapOffsetY - 32,
            String(tile)
        );

        // 足元の位置を保存
        wall.footY = y * tileSize + 64 + this.mapOffsetY;
        wall.setDepth(wall.footY);
        this.layers.wallVisual.push(wall);
    }
}

// 装飾の見た目レイヤー
for (const obj of this.objects) {
    obj.x = obj.tileX * tileSize + 32;
    obj.y = obj.tileY * tileSize + 32 + this.mapOffsetY;

    const decorationImage = this.add.image(
        obj.x,
        obj.y,
        obj.image
    );

    this.layers.decorationVisual.push(decorationImage);
}
    // 装飾の当たり判定レイヤー
for (const obj of this.objects) {
    this.layers.decorationCollision.push({
        tileX: obj.tileX,
        tileY: obj.tileY,
        x: obj.tileX * 64 + 32,
        y: obj.tileY * 64 + 32 + this.mapOffsetY,
        width: obj.hitboxWidth,
        height: obj.hitboxHeight
    });
}
    
    const player = this.add.image(288, 324, 'player');

    this.player = player;

    // 当たり判定用の座標
    
    this.playerBody = {
        x: 288,
        y: 324
    };

    // =========================
    // スティック
    // =========================

    // 最初は画面中央

    this.stickX = this.scale.width / 6;
    this.stickY = this.scale.height * 3 / 4;

    // 白い円
    this.whiteCircle = this.add.image(
        this.stickX,
        this.stickY,
        'whiteCircle'
    );

    // 黒い円
    this.blackCircle = this.add.image(
        this.stickX,
        this.stickY,
        'blackCircle'
    );

    this.whiteCircle.setAlpha(0.5);
    this.blackCircle.setAlpha(0.5);
    // 指を押しているか
    this.isDragging = false;

    // プレイヤー速度
    this.speed = 300;

    // =========================
    // 指を置いたとき
    // =========================

    this.input.on('pointerdown', (pointer) => {

        // 白い円をタップした場所へ移動
        this.stickX = pointer.x;
        this.stickY = pointer.y;

        this.whiteCircle.x = this.stickX;
        this.whiteCircle.y = this.stickY;

        // 黒い円を中央に戻す
        this.blackCircle.x = this.stickX;
        this.blackCircle.y = this.stickY;

        this.isDragging = true;
    });

    // =========================
    // 指を動かしているとき
    // =========================

    this.input.on('pointermove', (pointer) => {

        if (!this.isDragging) {
            return;
        }

        // 白い円の中心から指までの距離
        const dx = pointer.x - this.stickX;
        const dy = pointer.y - this.stickY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // 黒い円が動ける最大距離
        const maxDistance = 30;


        // 白い円の外へ出ないようにする
        if (distance > maxDistance) {

            const angle = Math.atan2(dy, dx);

            this.blackCircle.x =
                this.stickX + Math.cos(angle) * maxDistance;

            this.blackCircle.y =
                this.stickY + Math.sin(angle) * maxDistance;

        } else {

            this.blackCircle.x = pointer.x;
            this.blackCircle.y = pointer.y;
        }
    });

    // =========================
    // 指を離したとき
    // =========================

    this.input.on('pointerup', () => {

        this.isDragging = false;

        // 黒い円を中央へ戻す
        this.blackCircle.x = this.stickX;
        this.blackCircle.y = this.stickY;
    });

    this.debugText = this.add.text(10, 10, 'delta: --', {
        fontSize: '20px',
        color: '#ffffff'
    });

    this.startText = this.add.text(
    this.scale.width / 2,
    this.scale.height / 2,
    'START',
    {
        fontSize: '48px',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: {
            x: 30,
            y: 15
        }
    }
);

this.startText.setOrigin(0.5);
this.startText.setInteractive();

this.startText.on('pointerdown', () => {
    this.gameStarted = true;
    this.startText.destroy();
});
}

function update(time, delta) {
    if (!this.gameStarted) {
        return;
    }

    if (!this.isDragging) {
        return;
    }

    console.log("delta:", delta);

    this.debugText.setText('delta: ' + delta.toFixed(2));

    let dx = this.blackCircle.x - this.stickX;
    let dy = this.blackCircle.y - this.stickY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
        return;
    }

    const angle = Math.atan2(dy, dx);
    const moveAmount = this.speed * (delta / 1000);

    // ================================
    // サイズ
    // ================================

    const halfSize = 28;
    const visualHalfSize = 32;
    const visualOffset = 4;


// ================================
// 壁・装飾物との衝突判定
// ================================

const isColliding = (x, y) => {
    const left = x - halfSize;
    const right = x + halfSize;
    const top = y - halfSize;
    const bottom = y + halfSize;

    // 1. 壁の当たり判定レイヤー
    for (
        let row = 0;
        row < this.layers.wallCollision.length;
        row++
    ) {
        for (
            let col = 0;
            col < this.layers.wallCollision[row].length;
            col++
        ) {
            if (!this.layers.wallCollision[row][col]) {
                continue;
            }

            const wallLeft = col * 64;
            const wallRight = wallLeft + 64;
            const wallTop =
                row * 64 + this.mapOffsetY;
            const wallBottom = wallTop + 64;

            if (
                right > wallLeft &&
                left < wallRight &&
                bottom > wallTop &&
                top < wallBottom
            ) {
                return {
                    hit: true,
                    left: wallLeft,
                    right: wallRight,
                    top: wallTop,
                    bottom: wallBottom
                };
            }
        }
    }

    // 2. 装飾物の当たり判定レイヤー
    for (const object of this.layers.decorationCollision) {
        const objectLeft =
            object.x - object.width / 2;
        const objectRight =
            object.x + object.width / 2;
        const objectTop =
            object.y - object.height / 2;
        const objectBottom =
            object.y + object.height / 2;

        if (
            right > objectLeft &&
            left < objectRight &&
            bottom > objectTop &&
            top < objectBottom
        ) {
            return {
                hit: true,
                left: objectLeft,
                right: objectRight,
                top: objectTop,
                bottom: objectBottom
            };
        }
    }

    // 3. 何にも衝突していない
    return {
        hit: false
    };
};
    
    // ================================
    // X方向へ移動
    // ================================

    const nextX =
        this.playerBody.x +
        Math.cos(angle) * moveAmount;

    const hitX =
        isColliding(nextX, this.playerBody.y);

    if (!hitX.hit) {

        this.playerBody.x = nextX;

    } else {

        if (dx > 0) {

            this.playerBody.x =
                hitX.left - halfSize;

        } else if (dx < 0) {

            this.playerBody.x =
                hitX.right + halfSize;
        }
    }


    // ================================
    // Y方向へ移動
    // ================================

    const nextY =
        this.playerBody.y +
        Math.sin(angle) * moveAmount;

    const hitY =
        isColliding(this.playerBody.x, nextY);

    if (!hitY.hit) {

        this.playerBody.y = nextY;

    } else {

        if (dy > 0) {

            this.playerBody.y =
                hitY.top - halfSize;

        } else if (dy < 0) {

            this.playerBody.y =
                hitY.bottom + halfSize;
        }
    }


    // ================================
    // 1タイル幅の道への吸着
    // ================================

    const tileX =
        Math.floor(this.playerBody.x / 64);

    const tileY =
    Math.floor(
        (this.playerBody.y - this.mapOffsetY) / 64
    );

    const currentRow =
        this.mapData[tileY];

    if (currentRow) {

        const upperWall =
    this.layers.wallCollision[tileY - 1]?.[tileX] === true;
        const lowerWall =
    this.layers.wallCollision[tileY + 1]?.[tileX] === true;
        const centerY =
            tileY * 64 + 32 + this.mapOffsetY;

        // 上下が壁で挟まれた1タイル幅の道
        if (
            upperWall &&
            lowerWall &&
            !hitY.hit
        ) {

            this.playerBody.y +=
                (centerY - this.playerBody.y) * 1;
        }
    }


    // ================================
    // 見た目の画像
    // ================================

    let offsetX = 0;
    let offsetY = 0;

    const bodyLeft = this.playerBody.x - halfSize;
    const bodyRight = this.playerBody.x + halfSize;
    const bodyTop = this.playerBody.y - halfSize;
    const bodyBottom = this.playerBody.y + halfSize;

    // --------------------------------
    // 近くの壁だけ調べる
    // --------------------------------

for (
    let row = 0;
    row < this.layers.wallCollision.length;
    row++
) {
    for (
        let col = 0;
        col < this.layers.wallCollision[row].length;
        col++
    ) {
        // この下は今までの壁の見た目補正処理を残す

            const wallLeft = col * 64;
            const wallRight = wallLeft + 64;
            const wallTop = row * 64 + this.mapOffsetY;
            const wallBottom = row * 64 + 64 + this.mapOffsetY;

            // ============================
            // 左側の壁
            // ============================

            const leftGap =
                wallLeft - bodyRight;

            if (
                leftGap >= 0 &&
                leftGap < visualOffset &&
                bodyBottom > wallTop &&
                bodyTop < wallBottom
            ) {

                offsetX =
                    Math.min(
                        offsetX,
                        -(visualOffset - leftGap)
                    );
            }

            // ============================
            // 右側の壁
            // ============================

            const rightGap =
                bodyLeft - wallRight;

            if (
                rightGap >= 0 &&
                rightGap < visualOffset &&
                bodyBottom > wallTop &&
                bodyTop < wallBottom
            ) {

                offsetX =
                    Math.max(
                        offsetX,
                        visualOffset - rightGap
                    );
            }

            // ============================
            // 上側の壁
            // ============================

            const topGap =
                wallTop - bodyBottom;

            if (
                topGap >= 0 &&
                topGap < visualOffset &&
                bodyRight > wallLeft &&
                bodyLeft < wallRight
            ) {

                offsetY =
                    Math.min(
                        offsetY,
                        -(visualOffset - topGap)
                    );
            }

            // ============================
            // 下側の壁
            // ============================

            const bottomGap =
                bodyTop - wallBottom;

            if (
                bottomGap >= 0 &&
                bottomGap < visualOffset &&
                bodyRight > wallLeft &&
                bodyLeft < wallRight
            ) {

                offsetY =
                    Math.max(
                        offsetY,
                        visualOffset - bottomGap
                    );
            }
        }
    }

// ================================
// 装飾物との見た目の補正
// ================================

for (const obj of this.layers.decorationCollision) {
    const objectLeft =
        obj.x - obj.width / 2;

    const objectRight =
        obj.x + obj.width / 2;

    const objectTop =
        obj.y - obj.height / 2;

    const objectBottom =
        obj.y + obj.height / 2;

    // 左側の装飾物
    const leftGap = objectLeft - bodyRight;

    if (
        leftGap >= 0 &&
        leftGap < visualOffset &&
        bodyBottom > objectTop &&
        bodyTop < objectBottom
    ) {
        offsetX = Math.min(
            offsetX,
            -(visualOffset - leftGap)
        );
    }

    // 右側の装飾物
    const rightGap = bodyLeft - objectRight;

    if (
        rightGap >= 0 &&
        rightGap < visualOffset &&
        bodyBottom > objectTop &&
        bodyTop < objectBottom
    ) {
        offsetX = Math.max(
            offsetX,
            visualOffset - rightGap
        );
    }

    // 上側の装飾物
    const topGap = objectTop - bodyBottom;

    if (
        topGap >= 0 &&
        topGap < visualOffset &&
        bodyRight > objectLeft &&
        bodyLeft < objectRight
    ) {
        offsetY = Math.min(
            offsetY,
            -(visualOffset - topGap)
        );
    }

    // 下側の装飾物
    const bottomGap = bodyTop - objectBottom;

    if (
        bottomGap >= 0 &&
        bottomGap < visualOffset &&
        bodyRight > objectLeft &&
        bodyLeft < objectRight
    ) {
        offsetY = Math.max(
            offsetY,
            visualOffset - bottomGap
        );
    }
}
    // ================================
    // プレイヤー画像を表示
    // ================================

    this.player.x =
        this.playerBody.x + offsetX;

    this.player.y =
        this.playerBody.y + offsetY;
// プレイヤーの足元を基準に描画順を決める
const playerFootY = this.playerBody.y + 32;
this.player.setDepth(playerFootY + 1);

// 壁の描画順
for (const wall of this.layers.wallVisual) {
    wall.setDepth(wall.footY);
}

// 装飾物の描画順
for (const decoration of this.layers.decorationVisual) {
    decoration.setDepth(
        decoration.y + decoration.displayHeight / 2
    );
}
}
