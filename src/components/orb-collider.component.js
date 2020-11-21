const ZeroVector = new THREE.Vector3();

AFRAME.registerComponent('orb-collider', {

    tick: function (time, timeDelta) {
        const orbs = this.el.sceneEl.components.game.getOrbs();
        if (!orbs || !orbs.length || !this.el || !this.el.object3D) return;

        for (let i = 0; i < orbs.length; i++) {
            const element = orbs[i];
            const dist = this.el.object3D.position.distanceTo(orbs[i].object3D.getWorldPosition(ZeroVector));
            if (dist <= .3) {
                this.createExplosion(orbs[i], orbs[i].object3D.getWorldPosition(), '#ffffff', orbs[i].rotation)
                orbs[i].remove();
                this.el.sceneEl.components.game.addOrbScore(i);
                return;
            }
        }
    },
    createExplosion: function (el, position, color, rotation) {
        const container = document.getElementById('explosions');

        let ent = document.createElement("a-entity");
        ent.setAttribute("explosion", {
            color: color,
            rotation: rotation
        });
        ent.setAttribute("position", position);
        container.appendChild(ent);

    }
});

