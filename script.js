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
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
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

    const halfSize = 30;       // 当たり判定は60×60
    const visualHalfSize = 32; // 画像は64×64

    const visualOffset = visualHalfSize - halfSize;
    // → 2px


    // =========================
    // 次の位置
    // =========================

    const nextX =
        this.playerBody.x +
        Math.cos(angle) * moveAmount;

    const nextY =
        this.playerBody.y +
        Math.sin(angle) * moveAmount;


    // =========================
    // X方向の判定
    // =========================

    const canMoveX =
        this.mapData[
            Math.floor((this.playerBody.y - halfSize) / 64)
        ]?.[
            Math.floor((nextX - halfSize) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((this.playerBody.y - halfSize) / 64)
        ]?.[
            Math.floor((nextX + halfSize - 1) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((this.playerBody.y + halfSize - 1) / 64)
        ]?.[
            Math.floor((nextX - halfSize) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((this.playerBody.y + halfSize - 1) / 64)
        ]?.[
            Math.floor((nextX + halfSize - 1) / 64)
        ] === 0;


    // =========================
    // Y方向の判定
    // =========================

    const canMoveY =
        this.mapData[
            Math.floor((nextY - halfSize) / 64)
        ]?.[
            Math.floor((this.playerBody.x - halfSize) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((nextY - halfSize) / 64)
        ]?.[
            Math.floor((this.playerBody.x + halfSize - 1) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((nextY + halfSize - 1) / 64)
        ]?.[
            Math.floor((this.playerBody.x - halfSize) / 64)
        ] === 0 &&

        this.mapData[
            Math.floor((nextY + halfSize - 1) / 64)
        ]?.[
            Math.floor((this.playerBody.x + halfSize - 1) / 64)
        ] === 0;


    // =========================
    // 見た目のズレ
    // =========================

    let offsetX = 0;
    let offsetY = 0;


    // =========================
    // X方向
    // =========================

    if (canMoveX) {

        this.playerBody.x = nextX;

    } else {

        if (nextX > this.playerBody.x) {

            // 右の壁
            const wallX =
                Math.floor(
                    (nextX + halfSize) / 64
                );

            this.playerBody.x =
                wallX * 64 - halfSize;

            // 画像を左へ2px
            offsetX = -visualOffset;

        } else {

            // 左の壁
            const wallX =
                Math.floor(
                    (nextX - halfSize) / 64
                );

            this.playerBody.x =
                (wallX + 1) * 64 + halfSize;

            // 画像を右へ2px
            offsetX = visualOffset;
        }
    }


    // =========================
    // Y方向
    // =========================

    if (canMoveY) {

        this.playerBody.y = nextY;

    } else {

        if (nextY > this.playerBody.y) {

            // 下の壁
            const wallY =
                Math.floor(
                    (nextY + halfSize) / 64
                );

            this.playerBody.y =
                wallY * 64 - halfSize;

            // 画像を上へ2px
            offsetY = -visualOffset;

        } else {

            // 上の壁
            const wallY =
                Math.floor(
                    (nextY - halfSize) / 64
                );

            this.playerBody.y =
                (wallY + 1) * 64 + halfSize;

            // 画像を下へ2px
            offsetY = visualOffset;
        }
    }


    // =========================
    // 見た目の画像を配置
    // =========================

    this.player.x =
        this.playerBody.x + offsetX;

    this.player.y =
        this.playerBody.y + offsetY;
}
}
