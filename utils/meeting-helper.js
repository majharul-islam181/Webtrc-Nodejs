const meetingServices = require("../services/meeting.service");
const { MeetingPlayloadEnum } = require("../utils/meeting-payload.enum");

async function joinMeeting(meetingId, socket, payload, meetingServer) {
  const { userId, name } = payload;

  meetingServices.isMeetingPresent(meetingId, async (error, results) => {
    if (error & !results) {
      sendMessage(socket, {
        type: MeetingPlayloadEnum.NOT_FOUND,
      });
    }
    if (results) {
      addUser(socket, { meetingId, userId, name }).then(
        (result) => {
          if (result) {
            sendMessage(socket, {
              type: MeetingPlayloadEnum.JOINED_MEETING,
              data: {
                userId,
              },
            });
            //Not
            broadcastUsers(meetingId, socket, meetingServer, {
              type: MeetingPlayloadEnum.USER_JOINED,
              data: {
                userId,
                name,
                ...payload.data,
              },
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, name } = payload.data;
  var model = {
    meetingId: meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPlayloadEnum.CONNECTION_REQUEST,
        data: {
          userId,
          name,
          ...payload.data,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}

function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, candidate } = payload.data;
  var model = {
    meetingId: meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPlayloadEnum.OFFER_SDP,
        data: {
          userId,
          sdp,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}

function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, candidate } = payload.data;
  var model = {
    meetingId: meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPlayloadEnum.ANSWER_SDP,
        data: {
          userId,
          sdp,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}

function userLeft(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPlayloadEnum.USER_LEFT,
    data: {
      userId: userId,
    },
  });
}

function endMeeting(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: MeetingPlayloadEnum.MEETING_ENDED,
    data: {
      userId: userId,
    },
  });

  meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
    for (let i = 0; i < results.lenght; i++) {
      const meetingUser = results[i];
      meetingServer.socket.connected[meetingUser.socketId].disconnect();
    }
  });
}

function forwardEvent(meetingId, socket, meetingServer, payload) {
  const { userId } = payload.data;

  broadcastUsers(meetingId, socket, meetingServer, {
    type: payload.type,
    data: {
      userId: userId,
      ...payload.data,
    },
  });
}

function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
  const { userId, otherUserId, candidate } = payload.data;
  var model = {
    meetingId: meetingId,
    userId: otherUserId,
  };

  meetingServices.getMeetingUser(model, (error, results) => {
    if (results) {
      var sendPayload = JSON.stringify({
        type: MeetingPlayloadEnum.ICECANDIDATE,
        data: {
          userId,
          candidate,
        },
      });

      meetingServer.to(results.socketId).emit("message", sendPayload);
    }
  });
}

function addUser(socket, { meetingId, userId, name }) {
  let promise = new Promise(function (resolve, reject) {
    meetingServices.getAllMeetingUsers(
      { meetingId, userId },
      (error, results) => {
        if (!results) {
          var model = {
            socketId: socket.id,
            meetingId: meetingId,
            userId: userId,
            joined: true,
            name: name,
            isAlive: true,
          };
          meetingServices.joinMeeting(model, (error, results) => {
            if (results) {
              resolve(true);
            }
            if (error) {
              reject(error);
            }
          });
        } else {
          meetingServices.updateMeetingUser(
            {
              userId: userId,
              socketId: socket.id,
            },
            (error, results) => {
              if (results) {
                resolve(true);
              }
              if (error) {
                reject(error);
              }
            }
          );
        }
      }
    );
  });

  return promise;
}

function sendMessage(socket, payload) {
  socket.send(JSON.stringify(payload));
}

function broadcastUsers(meetingId, socket, meetingServer, payload) {
  socket.broadcast.emit("message", JSON.stringify(payload));
}

module.exports = {
  joinMeeting,
  forwardConnectionRequest,
  forwardIceCandidate,
  forwardOfferSDP,
  forwardAnswerSDP,
  userLeft,
  endMeeting,
  forwardEvent,
};
