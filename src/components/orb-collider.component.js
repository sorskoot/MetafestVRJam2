AFRAME.registerComponent('orb-collider', {
    tick: function (time, timeDelta) {
        const orbs = this.el.sceneEl.components.game.getOrbs();
        for (let i = 0; i < orbs.length; i++) {
            const element = orbs[i];
            const dist = this.el.object3D.position.distanceTo(orbs[i].el.object3D.position);
            if(dist <= 1){
                orbs[i].el.setAttribute('explode','');
                this.el.sceneEl.components.game.addOrbScore();
                return;
            }
        }
    },

});