
const got = require('got')

const MediaServer = require("medooze-media-server")

const SemanticSDP = require('semantic-sdp')

const SDPInfo		= SemanticSDP.SDPInfo
const MediaInfo		= SemanticSDP.MediaInfo
const CandidateInfo	= SemanticSDP.CandidateInfo
const DTLSInfo		= SemanticSDP.DTLSInfo
const ICEInfo		= SemanticSDP.ICEInfo
const StreamInfo	= SemanticSDP.StreamInfo
const TrackInfo		= SemanticSDP.TrackInfo
const Direction		= SemanticSDP.Direction
const CodecInfo		= SemanticSDP.CodecInfo

const capabilities =  {
    audio : {
        codecs		: ["opus"],
        extensions	: [ "urn:ietf:params:rtp-hdrext:ssrc-audio-level", "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"]
    },
    video : {
        codecs		: ["h264;level-asymmetry-allowed=1;packetization-mode=1"],
        //rtx		    : true,
        rtcpfbs		: [
            { "id": "transport-cc"},
            { "id": "ccm", "params": ["fir"]},
            { "id": "nack"},
            { "id": "nack", "params": ["pli"]}
        ],
        extensions	: [ "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"]
    }
}

MediaServer.enableDebug(true)
MediaServer.enableUltraDebug(true)


const pullstream = async () => {

    const endpoint = MediaServer.createEndpoint("10.170.155.12")
    const offer = endpoint.createOffer(capabilities)

    // make request 

    let data = {
        sdp: offer.toString(),
        streamurl: "webrtc://localhost/live/live",
        api: "http://10.170.155.12:1980/rtc/v1/play"
    }

    // console.dir(data)

    console.log(offer.toString())

    const {body} = await got.post('http://10.170.155.12:1985/rtc/v1/play', {
		json: {
            sdp: offer.toString(),
            streamurl: "webrtc://localhost/live/live",
            api: "http://10.170.155.12:1980/rtc/v1/play"
		},
		responseType: 'json'
    });
    
    console.dir(body)
    
    const reply = body

    const answer = SDPInfo.process(reply.sdp)

    const transport = endpoint.createTransport(answer, offer, {disableSTUNKeepAlive: false})
    transport.setLocalProperties(offer)
    transport.setRemoteProperties(answer)

    console.dir(answer.getStreams())

}


pullstream()





