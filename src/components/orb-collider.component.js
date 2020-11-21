const ZeroVector = new THREE.Vector3();

AFRAME.registerComponent('orb-collider', {
    tick: function (time, timeDelta) {
        const orbs = this.el.sceneEl.components.game.getOrbs();
        if(!orbs || !orbs.length || !this.el || !this.el.object3D) return;

        for (let i = 0; i < orbs.length; i++) {
            const element = orbs[i];            
            const dist = this.el.object3D.position.distanceTo(orbs[i].object3D.getWorldPosition(ZeroVector));
            if(dist <= .3){
                this.createExplosion(orbs[i], orbs[i].object3D.position, '#ffffff')
                this.el.sceneEl.components.game.addOrbScore();
                return;
            }
        }
    },
    createExplosion:function(el, position, color, size = .1, velocity = 16, outward = 200, burst = 5, lifetime=500) {
        if (el.parentElement) {
            let ent = document.createElement("a-entity");
            ent.setAttribute("explosion", {
                color: color, size: size,
                velocityStart: velocity, 
                outward: outward,
                burst: burst,
                lifetime:lifetime
            });
            ent.setAttribute("position", position);
            el.parentElement.append(ent);
        }
    }
});

