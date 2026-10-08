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
    this.load.image('0', './images/floor.png');
    this.load.image('1', './images/wall1.png');
    this.load.image('2', './images/black.png');

    this.load.image('00', './images/dot-Mygame_20261009081021.png');
}

function create() {
    const mapOffsetY = 4;
    this.mapOffsetY = mapOffsetY;
    this.wallTiles = [1, 2, 00];
    // オブジェクトの配置
    this.objects = [
        {tileX: 4,tileY: 5,image: '00'},
    ];
    this.mapData = [
    [2,1,1,1,1,2,2,2,1,1,1,1,1,1,2,2,2,2],
    [2,1,1,1,1,2,2,2,1,1,1,1,1,1,2,2,2,2],
    [2,0,0,0,0,2,2,2,0,0,0,0,0,0,2,2,2,2],
    [2,0,2,2,0,2,1,1,0,0,0,0,0,0,2,2,2,2],
    [2,0,1,1,0,2,0,0,0,0,0,2,2,2,2,2,2,2],
    [2,0,0,0,0,2,2,2,2,2,0,2,2,2,2,2,2,2],
    [2,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,2,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ];
    const tileSize = 64;
    for (let y = 0; y < this.mapData.length; y++) {
        for (let x = 0; x < this.mapData[y].length; x++) {

            this.add.image(
                x * tileSize + tileSize / 2,
                y * tileSize + tileSize / 2 + this.mapOffsetY,
                String(this.mapData[y][x])
            );
        }
    }

    for (const obj of this.objects) {
        this.add.image(
            obj.tileX * 64 + 32,
            obj.tileY * 64 + 32 + this.mapOffsetY,
            obj.image
        );
    }
    
    const player = this.add.image(288, 292, 'player');

    this.player = player;

    // 当たり判定用の座標
    
    this.playerBody = {
        x: 288,
        y: 292
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
    // 壁との衝突判定
    // ================================

    const isColliding = (x, y) => {

        const left = x - halfSize;
        const right = x + halfSize;
        const top = y - halfSize;
        const bottom = y + halfSize;

        for (let row = 0; row < this.mapData.length; row++) {

            for (let col = 0; col < this.mapData[row].length; col++) {

                if (!this.wallTiles.includes(this.mapData[row][col])) {
                    continue;
                }

                const wallLeft = col * 64;
                const wallRight = wallLeft + 64;
                const wallTop = row * 64 + this.mapOffsetY;
                const wallBottom = row * 64 + 64 + this.mapOffsetY;

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
            this.mapData[tileY - 1]?.[tileX] === 1;

        const lowerWall =
            this.mapData[tileY + 1]?.[tileX] === 1;

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

    const bodyLeft =
        this.playerBody.x - halfSize;

    const bodyRight =
        this.playerBody.x + halfSize;

    const bodyTop =
        this.playerBody.y - halfSize;

    const bodyBottom =
        this.playerBody.y + halfSize;


    // --------------------------------
    // 近くの壁だけ調べる
    // --------------------------------

    for (let row = 0; row < this.mapData.length; row++) {

        for (let col = 0; col < this.mapData[row].length; col++) {

            if (!this.wallTiles.includes(this.mapData[row][col])) {
                continue;
            }

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
    // プレイヤー画像を表示
    // ================================

    this.player.x =
        this.playerBody.x + offsetX;

    this.player.y =
        this.playerBody.y + offsetY;
}
