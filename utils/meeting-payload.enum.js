const MeetingPayloadEnum = {
  JOINT_MEETING: "joint-meeting",
  JOINED_MEETING: "joined-meeting",
  USER_JOINED: "user-joined",
  CONNECTION_REQUEST: "connection-request",
  INCOMING_CONNECTION_REQUEST: "incoming-connection-request",
  OFFER_SDP: "offer-sdp",
  ANSWER_SDP: "answer-sdp",
  LEAVE_MEETING: "leave-meeting",
  END_MEETING: "end-meeting",
  USER_LEFT: "user-left",
  MEETING_ENDED: "meeting-ended",
  ICECANDIDATE: "ice-candidate",
  VIDEO_TOGGLE: "video-toggle",
  AUDIO_TOGGLE: "audio-toggle",
  NOT_FOUND: "not-found",
  UNKWON: "unkwon",
};

module.exports ={
    MeetingPayloadEnum,
}