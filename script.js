// Deploy Preview test
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game',
    backgroundColor: '#c0c0c0',

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
    this.load.image('floor', './images/floor.png');
    this.load.image('wall', './images/wall1.png');
}

function create() {
    this.mapData = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    const tileSize = 64;
    for (let y = 0; y < this.mapData.length; y++) {
        for (let x = 0; x < this.mapData[y].length; x++) {

            if (this.mapData[y][x] === 0) {
                this.add.image(
                    x * tileSize + tileSize / 2,
                    y * tileSize + tileSize / 2,
                    'floor'
                );
            }
            if (this.mapData[y][x] === 1) {
                this.add.image(
                    x * tileSize + tileSize / 2,
                    y * tileSize + tileSize / 2,
                    'wall'
                );
            }
        }
    }
    
    const player = this.add.image(480, 270, 'player');

    this.player = player;

    // 当たり判定用の座標
    
    this.playerBody = {
        x: 480,
        y: 270
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
}

function update(time, delta) {

    if (!this.isDragging) {
        return;
    }

    const dx = this.blackCircle.x - this.stickX;
    const dy = this.blackCircle.y - this.stickY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
        return;
    }

    const angle = Math.atan2(dy, dx);
    const moveAmount = this.speed * (delta / 1000);

    // 当たり判定
    const halfSize = 30;

    // 見た目の画像
    const visualHalfSize = 32;

    // 見た目だけ2px外側へ
    const visualOffset = 2;


    // =================================
    // 壁にぶつかっているか調べる関数
    // =================================

    const isColliding = (x, y) => {

        const left = x - halfSize;
        const right = x + halfSize;
        const top = y - halfSize;
        const bottom = y + halfSize;

        for (let row = 0; row < this.mapData.length; row++) {

            for (let col = 0; col < this.mapData[row].length; col++) {

                if (this.mapData[row][col] !== 1) {
                    continue;
                }

                const wallLeft = col * 64;
                const wallRight = wallLeft + 64;
                const wallTop = row * 64;
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

        return {
            hit: false
        };
    };


    // =================================
    // X方向
    // =================================

    const nextX =
        this.playerBody.x +
        Math.cos(angle) * moveAmount;

    const hitX = isColliding(nextX, this.playerBody.y);


    if (!hitX.hit) {

        this.playerBody.x = nextX;

    } else {

        if (dx > 0) {

            // 右の壁
            this.playerBody.x =
                hitX.left - halfSize;

        } else if (dx < 0) {

            // 左の壁
            this.playerBody.x =
                hitX.right + halfSize;
        }
    }


    // =================================
    // Y方向
    // =================================

    const nextY =
        this.playerBody.y +
        Math.sin(angle) * moveAmount;

    const hitY = isColliding(this.playerBody.x, nextY);


    if (!hitY.hit) {

        this.playerBody.y = nextY;

    } else {

        if (dy > 0) {

            // 下の壁
            this.playerBody.y =
                hitY.top - halfSize;

        } else if (dy < 0) {

            // 上の壁
            this.playerBody.y =
                hitY.bottom + halfSize;
        }
    }
    
    // =================================
    // 1タイル幅の道への軽い吸着
    // =================================

    const centerX =

        Math.floor(this.playerBody.x / 64) * 64 + 32;

    const centerY =

        Math.floor(this.playerBody.y / 64) * 64 + 32;

    // 上下が壁で挟まれている場合
    const tileX =

        Math.floor(this.playerBody.x / 64);

    const tileY =

        Math.floor(this.playerBody.y / 64);

    const currentRow = this.mapData[tileY];

    if (currentRow) {

        const upperWall =
    
            this.mapData[tileY - 1]?.[tileX] === 1;


        const lowerWall =
    
            this.mapData[tileY + 1]?.[tileX] === 1;


        if (upperWall && lowerWall) {

            this.playerBody.y +=
        
                (centerY - this.playerBody.y) * 0.15;
        }
    }

    // =================================
    // 見た目の画像
    // =================================

    let offsetX = 0;
    let offsetY = 0;

    if (hitX.hit) {
        offsetX = -Math.sign(dx) * visualOffset;
    }

    if (hitY.hit) {
        offsetY = -Math.sign(dy) * visualOffset;
    }

    this.player.x =
        this.playerBody.x + offsetX;

    this.player.y =
        this.playerBody.y + offsetY;
}
