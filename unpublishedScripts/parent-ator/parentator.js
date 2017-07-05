//  parentator.js
//
//  Script Type: Entity
//  Created by Jeff Moyes on 6/30/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script shoots a ping pong ball.
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


(function() {

    var MESSAGE_1_TEXTURE_URL = Script.resolvePath('resources/message-1-start.png');
    var MESSAGE_2_TEXTURE_URL = Script.resolvePath('resources/message-2-noperms.png');
    var MESSAGE_3_TEXTURE_URL = Script.resolvePath('resources/message-3-tryagain.png');
    var MESSAGE_4_TEXTURE_URL = Script.resolvePath('resources/message-4-setparent.png');
    var MESSAGE_5_TEXTURE_URL = Script.resolvePath('resources/message-5-success.png');

    var SOUND_1_URL = Script.resolvePath('resources/parent-tool-sound1.wav');
    var SOUND_2_URL = Script.resolvePath('resources/parent-tool-sound2.wav');
    var SOUND_ERROR_URL = Script.resolvePath('resources/parent-tool-sound-error.wav');
    var SOUND_SUCCESS_URL = Script.resolvePath('resources/parent-tool-sound-success.wav');
    var SOUND_1, SOUND_2, SOUND_ERROR, SOUND_SUCCESS;

    var childEntityID = 0;
    var parentEntityID = 0;

    function Parentator() {
        return;
    }

    Parentator.prototype.preload = function(entityID) {
        this.entityID = entityID;
        SOUND_1 = SoundCache.getSound(SOUND_1_URL);
        SOUND_2 = SoundCache.getSound(SOUND_2_URL);
        SOUND_ERROR = SoundCache.getSound(SOUND_ERROR_URL);
        SOUND_SUCCESS = SoundCache.getSound(SOUND_SUCCESS_URL);
    };

    Parentator.prototype.startEquip = function(entityID, args) {
        if (Entities.canRez()) {
            Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_1_TEXTURE_URL }) });
            this.playSoundAtCurrentPosition(SOUND_1);
        } else {
            Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_2_TEXTURE_URL }) });
            this.playSoundAtCurrentPosition(SOUND_ERROR);
        }
    };

    Parentator.prototype.collisionWithEntity = function(parentatorID, collidedID, collisionInfo) {
        // We don't want to be able to select Lights, Zone, and Particles but they are not collidable anyway so we don't have to worry about them
        var collidedEntityProperties = Entities.getEntityProperties(collidedID);

        // User has just reclicked the first entity (or it's 'bounced')
        if ( childEntityID == collidedID ) {
            return;
        }

        if (collidedEntityProperties.locked) {
            Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_3_TEXTURE_URL }) });
            this.playSoundAtCurrentPosition(SOUND_ERROR);
            return;
        }

        // If no entity has been chosen
        if ( childEntityID == 0 ) {
            childEntityID = collidedID;

            // if there is a parentID, remove it
            if (collidedEntityProperties.parentID != "{00000000-0000-0000-0000-000000000000}") {
                Entities.editEntity( collidedID, { parentID: "{00000000-0000-0000-0000-000000000000}" });
            }

            if (collidedEntityProperties.dynamic) {
                Entities.editEntity( collidedID, { dynamic: false });
            }

            Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_4_TEXTURE_URL }) });
            this.playSoundAtCurrentPosition(SOUND_2);
        } else {
            parentEntityID = collidedID;
            this.setParent();
        }
    };

    Parentator.prototype.setParent = function() {
        Entities.editEntity(childEntityID, { parentID: parentEntityID });
        Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_5_TEXTURE_URL }) });

        Script.setTimeout(function() {
            childEntityID = 0;
            parentEntityID = 0;
            Entities.editEntity( this.entityID, { textures: JSON.stringify({ "message-1-start.png.001": MESSAGE_1_TEXTURE_URL }) });
            this.playSoundAtCurrentPosition(SOUND_SUCCESS);
        }.bind(this), 5000);
    };

    Parentator.prototype.playSoundAtCurrentPosition = function(sound) {
        var audioProperties = {
            volume: 0.3,
            position: Entities.getEntityProperties(this.entityID).position
        }
        Audio.playSound(sound, audioProperties);
    };

    Parentator.prototype.unload = function () {
        Entities.deleteEntity(this.entityID);
    };


    // entity scripts always need to return a newly constructed object of our type
    return new Parentator();
});
