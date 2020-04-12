import { Response, Request, Router } from 'express'



const got   = require("got")
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


MediaServer.enableDebug(true)
MediaServer.enableUltraDebug(true)


import config from './config'
import incomingStreams from './streams'


const apiRouter = Router()


apiRouter.get('/test', async (req: Request, res: Response) => {
    res.send('hello world')
})


apiRouter.get('/', async (req: Request, res: Response) => {
    res.sendFile('play.html', { root: __dirname + '/../public'})
})


apiRouter.post('/rtc/v1/play', async (req: Request, res: Response) => {

    // one endpoint for one stream 
    const endpoint = MediaServer.createEndpoint(config.endpoint)

    const sdp = req.body.sdp
    const streamurl = req.body.streamurl

    console.log("play stream ", streamurl)

    const offer = SDPInfo.process(sdp)
    const transport = endpoint.createTransport(offer)
    transport.setRemoteProperties(offer)


    const answer = offer.answer({
        dtls        : transport.getLocalDTLSInfo(),
        ice		    : transport.getLocalICEInfo(),
        candidates	: endpoint.getLocalCandidates(),
        capabilities:  config.capabilities
    })

    transport.setLocalProperties(answer)


    // relay from  another media server

    const remoteOffer = endpoint.createOffer(config.capabilities)

    const { body } = await got.post('http://10.170.155.12:1985/rtc/v1/play', {
		json: {
            sdp: remoteOffer.toString(),
            streamurl: streamurl,
            api: "http://10.170.155.12:1985/rtc/v1/play"
		},
		responseType: 'json'
    })

    const remoteAnswer = SDPInfo.process(body.sdp)

    const remoteTransport = endpoint.createTransport(remoteAnswer, remoteOffer, {disableSTUNKeepAlive: true})
    remoteTransport.setLocalProperties(remoteOffer)
    remoteTransport.setRemoteProperties(remoteAnswer)

    const remoteIncomingStreamInfo = remoteAnswer.getFirstStream()

    const incomingStream = remoteTransport.createIncomingStream(remoteIncomingStreamInfo)

    const outgoingStream = transport.publish(incomingStream)
    answer.addStream(outgoingStream.getStreamInfo())

    console.dir(answer)

    res.json({
        code: 200,
        sdp: answer.toString()
    })

})


export default apiRouter