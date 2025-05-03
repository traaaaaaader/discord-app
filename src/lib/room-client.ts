// src/lib/room-client.ts
import { Socket } from "socket.io-client";
import { Device } from "mediasoup-client";
import { types as mediasoupTypes } from "mediasoup-client";
import EventEmitter from "eventemitter3";

// Типы медиа и событий
export const mediaType = {
  audio: "audioType",
  video: "videoType",
  screen: "screenType",
} as const;

export type RoomClientEvents = {
  stream: { stream: MediaStream; kind: string; id: string };
};

export class RoomClient extends EventEmitter<RoomClientEvents> {
  private socket: Socket;
  private device?: Device;
  private producerTransport?: mediasoupTypes.Transport;
  private consumerTransport?: mediasoupTypes.Transport;
  private _producers = new Map<string, mediasoupTypes.Producer>();
  public get producers() {
    return this._producers;
  }
  private _consumers = new Map<string, mediasoupTypes.Consumer>();
  public get consumers() {
    return this._consumers;
  }
  private producerLabel = new Map<string, string>();

  private _isOpen = false;
  public isOpen = () => {
    return this._isOpen;
  };

  constructor(socket: Socket, private roomId: string, private name: string) {
    super();
    this.socket = socket;
    this.name = name;
    this.roomId = roomId;
    this.setupRequest();
    console.log(`[RoomClient] constructor: roomId=${roomId}, name=${name}`);
    this.joinRoom()
      .then(() => (this._isOpen = true))
      .catch((err) => console.error("[RoomClient] joinRoom error", err));
  }

  // PRIVATE: setup
  private setupRequest() {
    console.log("[RoomClient] setupRequest");
    (this.socket as any).request = (type: string, data = {}) =>
      new Promise<any>((resolve, reject) => {
        console.log(`[RoomClient] socket.request -> ${type}`, data);
        this.socket.emit(type, data, (response: any) => {
          console.log(`[RoomClient] socket.response <- ${type}`, response);
          response?.error ? reject(response.error) : resolve(response);
        });
      });
  }

  private async joinRoom() {
    console.log("[RoomClient] joinRoom start");
    await this.tryCreateRoom();

    await (this.socket as any).request("join", {
      room_id: this.roomId,
      name: this.name,
    });

    const rtpCaps = await (this.socket as any).request(
      "getRouterRtpCapabilities"
    );

    await this.createDevice(rtpCaps);
    console.log("[RoomClient] device loaded");

    await this.createProducerTransport();
    console.log("[RoomClient] producerTransport created");

    await this.createConsumerTransport();
    console.log("[RoomClient] consumerTransport created");

    this.initSocketEvents();
    // console.log("[RoomClient] emitting openRoom event");
    // this.emitEvent(EVENTS.openRoom);
  }

  private async tryCreateRoom() {
    try {
      console.log("[RoomClient] tryCreateRoom: creating room");
      const data = await (this.socket as any).request("createRoom", {
        room_id: this.roomId,
      });
      console.log("data", data);
    } catch (error) {
      console.log("[RoomClient] tryCreateRoom: room exists, skipping");
    }
  }

  private async createDevice(
    routerRtpCapabilities: mediasoupTypes.RtpCapabilities
  ) {
    this.device = new Device();
    await this.device.load({ routerRtpCapabilities });
    console.log("[RoomClient] createDevice, device=", this.device);
  }

  private async createProducerTransport() {
    console.log("[RoomClient] createProducerTransport");

    if (!this.device) {
      console.log("[RoomClient] createProducerTransport no device");
      return;
    }

    const params = await (this.socket as any).request("createWebRtcTransport", {
      forceTcp: false,
      rtpCapabilities: this.device.rtpCapabilities,
    });

    if (params.error) {
      console.error(
        "[RoomClient] createWebRtcTransport params error: ",
        params.error
      );
      return;
    }

    this.producerTransport = this.device.createSendTransport(params);

    this.producerTransport.on("connectionstatechange", (state) => {
      switch (state) {
        case "connecting":
          console.log("transport connecting");
          break;
        case "connected":
          console.log("transport connected");
          break;
        case "failed":
          console.log("transport failed – closing");
          this.producerTransport?.close();
          break;
        default:
          break;
      }
    });

    this.producerTransport.on("connect", ({ dtlsParameters }, cb, eb) => {
      console.log("[RoomClient] producerTransport.connect");
      (this.socket as any)
        .request("connectTransport", {
          transport_id: params.id,
          dtlsParameters,
        })
        .then(cb)
        .catch(eb);
    });

    this.producerTransport.on(
      "produce",
      async ({ kind, rtpParameters }, cb, eb) => {
        console.log("[RoomClient] producerTransport.produce", {
          kind,
          rtpParameters,
        });
        try {
          const producer_id = await (this.socket as any).request("produce", {
            producerTransportId: this.producerTransport!.id,
            kind,
            rtpParameters,
          });
          console.log(
            "[RoomClient] produce response producer_id=",
            producer_id
          );
          cb({ id: producer_id });
        } catch (err: any) {
          eb(err);
        }
      }
    );
  }

  private async createConsumerTransport() {
    console.log("[RoomClient] createConsumerTransport");

    if (!this.device) {
      console.log("[RoomClient] createProducerTransport no device");
      return;
    }

    const params = await (this.socket as any).request("createWebRtcTransport", {
      forceTcp: false,
    });

    if (params.error) {
      console.error(
        "[RoomClient] createWebRtcTransport params error: ",
        params.error
      );
      return;
    }

    this.consumerTransport = this.device.createRecvTransport(params);
    this.consumerTransport.on("connect", ({ dtlsParameters }, cb, eb) => {
      console.log("[RoomClient] consumerTransport.connect");
      (this.socket as any)
        .request("connectTransport", {
          transport_id: params.id,
          dtlsParameters,
        })
        .then(cb)
        .catch(eb);
    });

    this.consumerTransport.on("connectionstatechange", (state) => {
      switch (state) {
        case "connecting":
          break;
        case "connected":
          break;
        case "failed":
          this.consumerTransport?.close();
          break;
        default:
          break;
      }
    });
  }

  private initSocketEvents() {
    console.log("[RoomClient] initSocketEvents");
    this.socket.on("newProducers", (data: [{ producer_id: string }]) =>
      data.forEach(({ producer_id }) => this.consume(producer_id))
    );
    this.socket.on("consumerClosed", (consumer_id: string) =>
      this.consumers.delete(consumer_id)
    );
    this.socket.on("disconnect", () => this.exit(true));
  }

  async produce(
    type: (typeof mediaType)[keyof typeof mediaType],
    deviceId?: string
  ) {
    console.log(`[RoomClient] produce: type= ${type} deviceId= ${deviceId}`);

    if (!this.device || !this.producerTransport) {
      console.log(
        "No device or transport ",
        this.device,
        this.producerTransport
      );
      return;
    }
    if (type !== mediaType.audio && !this.device.canProduce("video")) {
      console.error("Cannot produce video");
      return;
    }
    if (this.producerLabel.has(type)) {
      console.log("Producer already exists for this type " + type);
      return;
    }

    const stream = await this.acquireStream(type, deviceId);
    if (!stream) return;

    console.log(`[RoomClient] produce: stream acquired`, stream);
    const track: MediaStreamTrack =
      type === mediaType.audio
        ? stream.getAudioTracks()[0]
        : stream.getVideoTracks()[0];
    console.log(`[RoomClient] produce: producing track kind= ${track.kind}`);

    if (this.producerTransport.closed) {
      console.log(
        "[RoomClient] Cannot produce: producerTransport is already closed"
      );
      await this.createProducerTransport();
    }

    console.log("[RoomClient] before transport.produce");

    const producer = await this.producerTransport.produce({
      track,
      encodings: [
        {
          rid: "r0",
          maxBitrate: 100000,
          scalabilityMode: "S1T3",
        },
        {
          rid: "r1",
          maxBitrate: 300000,
          scalabilityMode: "S1T3",
        },
        {
          rid: "r2",
          maxBitrate: 900000,
          scalabilityMode: "S1T3",
        },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
    });
    console.log(`[RoomClient] producer= ${producer}`);

    producer.on("trackended", () => {
      console.log("TRACK END")
      this.closeProducer(type);
    });

    producer.on("transportclose", () => {
      console.log("TRANSPORT CLOSE")
      this.producers.delete(producer.id);
    });

    console.log(`[RoomClient] produce: got producer id= ${producer.id}`);
    this.registerProducer(type, producer);

    console.log(`[RoomClient] stream = ${stream}, kind = ${producer.kind}`);

    this.emit("stream", { stream, kind: producer.kind, id: producer.id });

    return {
      stream,
      id: producer.id,
    };
  }

  private async acquireStream(
    type: string,
    deviceId?: string
  ): Promise<MediaStream | undefined> {
    console.log(
      `[RoomClient] acquireStream type= ${type} deviceId= ${deviceId}`
    );
    try {
      if (type === mediaType.screen) {
        console.log("[RoomClient] calling getDisplayMedia");
        return await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
      }
      const constraints: MediaStreamConstraints =
        type === mediaType.audio
          ? { audio: deviceId ? { deviceId } : true }
          : { video: { deviceId: deviceId || undefined }, audio: false };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error("[RoomClient] Could not acquire media stream", err);
    }
  }

  private registerProducer(type: string, producer: mediasoupTypes.Producer) {
    this.producers.set(producer.id, producer);
    this.producerLabel.set(type, producer.id);
    producer.on("transportclose", () => this.producers.delete(producer.id));
    producer.on("trackended", () => this.closeProducer(type));
  }

  closeProducer(type: string) {
    const pid = this.producerLabel.get(type);
    if (!pid) return;
    this.producers.get(pid)?.close();
    this.producers.delete(pid);
    this.producerLabel.delete(type);
  }

  private async consume(producerId: string) {
    console.log("[RoomClient] consume producerId=", producerId);
    if (!this.device || !this.consumerTransport) {
      console.log("[RoomClient] consume no device!!!!!!!!!!!!!!!!!");
      return;
    }
    const { rtpCapabilities } = this.device;
    const { id, kind, rtpParameters } = await (this.socket as any).request(
      "consume",
      {
        rtpCapabilities,
        consumerTransportId: this.consumerTransport.id,
        producerId,
      }
    );

    console.log(
      `[RoomClient] consume id=${id}, kind=${kind}, rtpParameters=${rtpParameters}`
    );

    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });

    this.consumers.set(consumer.id, consumer);

    if (!consumer) {
      console.log("[RoomClient] consomer undefined");
      return;
    }

    consumer.on("trackended", () => {
      this.consumers.delete(consumer.id);
    });

    consumer.on("transportclose", () => {
      this.consumers.delete(consumer.id);
    });

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    this.emit("stream", { stream, kind, id: consumer.id });

    return {
      consumer,
      stream,
      kind,
    };
  }

  exit(offline = false) {
    if (!offline) {
      (this.socket as any).request("exitRoom").catch(console.warn);
    }
    this.producerTransport?.close();
    this.consumerTransport?.close();
    this._isOpen = false;
  }
}
