const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    backgroundColor: '#ffffff',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', './images/IMG_0410.png');
}

function create() {
    const player = this.add.image(400, 225, 'player');
    player.setDisplaySize(100, 100);

    let startX;
    let startY;

    this.input.on('pointerdown', (pointer) => {
        startX = pointer.x;
        startY = pointer.y;
    });

    this.input.on('pointerdown', (pointer) => {
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;

        const angle = Math.atan2(dy, dx);
　　     const distance = 200;

        const targetX = player.x + Math.cos(angle) * distance;
        const targetY = player.y + Math.sin(angle) * distance;

        this.tweens.add({
            targets: player,
            x: targetX,
            y: targetY,
            duration: 500
        });
    });
}
