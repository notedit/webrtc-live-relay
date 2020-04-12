export default {
    endpoint: '10.170.155.12',
    capabilities:  {
        audio : {
            codecs		: ["opus"],
            extensions	: [ 
                "urn:ietf:params:rtp-hdrext:ssrc-audio-level", 
                "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"
            ]
        },
        video : {
            codecs		: ["h264"],
            //rtx		: true,
            rtcpfbs		: [
                { "id": "transport-cc"},
                { "id": "ccm", "params": ["fir"]},
                { "id": "nack"},
                { "id": "nack", "params": ["pli"]}
            ],
            extensions	: [ 
                "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01"
            ]
        }
    }
}