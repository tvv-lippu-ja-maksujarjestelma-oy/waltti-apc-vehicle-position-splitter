import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace transit_realtime. */
export namespace transit_realtime {
  /**
   * Properties of a FeedMessage.
   * @deprecated Use transit_realtime.FeedMessage.$Properties instead.
   */
  interface IFeedMessage extends transit_realtime.FeedMessage.$Properties {}

  /** Represents a FeedMessage. */
  class FeedMessage {
    /**
     * Constructs a new FeedMessage.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.FeedMessage.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** FeedMessage header. */
    header: transit_realtime.FeedHeader.$Properties;

    /** FeedMessage entity. */
    entity: transit_realtime.FeedEntity.$Properties[];

    /**
     * Creates a new FeedMessage instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FeedMessage instance
     */
    static create(
      properties: transit_realtime.FeedMessage.$Shape
    ): transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape;
    static create(
      properties?: transit_realtime.FeedMessage.$Properties
    ): transit_realtime.FeedMessage;

    /**
     * Encodes the specified FeedMessage message. Does not implicitly {@link transit_realtime.FeedMessage.verify|verify} messages.
     * @param message FeedMessage message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.FeedMessage.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified FeedMessage message, length delimited. Does not implicitly {@link transit_realtime.FeedMessage.verify|verify} messages.
     * @param message FeedMessage message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.FeedMessage.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a FeedMessage message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape} FeedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape;

    /**
     * Decodes a FeedMessage message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape} FeedMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.FeedMessage & transit_realtime.FeedMessage.$Shape;

    /**
     * Verifies a FeedMessage message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a FeedMessage message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns FeedMessage
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.FeedMessage;

    /**
     * Creates a plain object from a FeedMessage message. Also converts values to other types if specified.
     * @param message FeedMessage
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.FeedMessage,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this FeedMessage to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for FeedMessage
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace FeedMessage {
    /** Properties of a FeedMessage. */
    interface $Properties {
      /** FeedMessage header */
      header: transit_realtime.FeedHeader.$Properties;

      /** FeedMessage entity */
      entity?: transit_realtime.FeedEntity.$Properties[] | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a FeedMessage. */
    type $Shape = transit_realtime.FeedMessage.$Properties;
  }

  /**
   * Properties of a FeedHeader.
   * @deprecated Use transit_realtime.FeedHeader.$Properties instead.
   */
  interface IFeedHeader extends transit_realtime.FeedHeader.$Properties {}

  /** Represents a FeedHeader. */
  class FeedHeader {
    /**
     * Constructs a new FeedHeader.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.FeedHeader.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** FeedHeader gtfsRealtimeVersion. */
    gtfsRealtimeVersion: string;

    /** FeedHeader incrementality. */
    incrementality: transit_realtime.FeedHeader.Incrementality;

    /** FeedHeader timestamp. */
    timestamp: number | Long;

    /**
     * Creates a new FeedHeader instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FeedHeader instance
     */
    static create(
      properties: transit_realtime.FeedHeader.$Shape
    ): transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape;
    static create(
      properties?: transit_realtime.FeedHeader.$Properties
    ): transit_realtime.FeedHeader;

    /**
     * Encodes the specified FeedHeader message. Does not implicitly {@link transit_realtime.FeedHeader.verify|verify} messages.
     * @param message FeedHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.FeedHeader.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified FeedHeader message, length delimited. Does not implicitly {@link transit_realtime.FeedHeader.verify|verify} messages.
     * @param message FeedHeader message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.FeedHeader.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a FeedHeader message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape} FeedHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape;

    /**
     * Decodes a FeedHeader message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape} FeedHeader
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.FeedHeader & transit_realtime.FeedHeader.$Shape;

    /**
     * Verifies a FeedHeader message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a FeedHeader message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns FeedHeader
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.FeedHeader;

    /**
     * Creates a plain object from a FeedHeader message. Also converts values to other types if specified.
     * @param message FeedHeader
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.FeedHeader,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this FeedHeader to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for FeedHeader
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace FeedHeader {
    /** Properties of a FeedHeader. */
    interface $Properties {
      /** FeedHeader gtfsRealtimeVersion */
      gtfsRealtimeVersion: string;

      /** FeedHeader incrementality */
      incrementality?: transit_realtime.FeedHeader.Incrementality | null;

      /** FeedHeader timestamp */
      timestamp?: number | Long | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a FeedHeader. */
    type $Shape = transit_realtime.FeedHeader.$Properties;

    /** Incrementality enum. */
    enum Incrementality {
      /** FULL_DATASET value */
      FULL_DATASET = 0,

      /** DIFFERENTIAL value */
      DIFFERENTIAL = 1,
    }
  }

  /**
   * Properties of a FeedEntity.
   * @deprecated Use transit_realtime.FeedEntity.$Properties instead.
   */
  interface IFeedEntity extends transit_realtime.FeedEntity.$Properties {}

  /** Represents a FeedEntity. */
  class FeedEntity {
    /**
     * Constructs a new FeedEntity.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.FeedEntity.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** FeedEntity id. */
    id: string;

    /** FeedEntity isDeleted. */
    isDeleted: boolean;

    /** FeedEntity tripUpdate. */
    tripUpdate?: transit_realtime.TripUpdate.$Properties | null;

    /** FeedEntity vehicle. */
    vehicle?: transit_realtime.VehiclePosition.$Properties | null;

    /** FeedEntity alert. */
    alert?: transit_realtime.Alert.$Properties | null;

    /**
     * Creates a new FeedEntity instance using the specified properties.
     * @param [properties] Properties to set
     * @returns FeedEntity instance
     */
    static create(
      properties: transit_realtime.FeedEntity.$Shape
    ): transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape;
    static create(
      properties?: transit_realtime.FeedEntity.$Properties
    ): transit_realtime.FeedEntity;

    /**
     * Encodes the specified FeedEntity message. Does not implicitly {@link transit_realtime.FeedEntity.verify|verify} messages.
     * @param message FeedEntity message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.FeedEntity.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified FeedEntity message, length delimited. Does not implicitly {@link transit_realtime.FeedEntity.verify|verify} messages.
     * @param message FeedEntity message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.FeedEntity.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a FeedEntity message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape} FeedEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape;

    /**
     * Decodes a FeedEntity message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape} FeedEntity
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.FeedEntity & transit_realtime.FeedEntity.$Shape;

    /**
     * Verifies a FeedEntity message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a FeedEntity message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns FeedEntity
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.FeedEntity;

    /**
     * Creates a plain object from a FeedEntity message. Also converts values to other types if specified.
     * @param message FeedEntity
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.FeedEntity,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this FeedEntity to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for FeedEntity
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace FeedEntity {
    /** Properties of a FeedEntity. */
    interface $Properties {
      /** FeedEntity id */
      id: string;

      /** FeedEntity isDeleted */
      isDeleted?: boolean | null;

      /** FeedEntity tripUpdate */
      tripUpdate?: transit_realtime.TripUpdate.$Properties | null;

      /** FeedEntity vehicle */
      vehicle?: transit_realtime.VehiclePosition.$Properties | null;

      /** FeedEntity alert */
      alert?: transit_realtime.Alert.$Properties | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a FeedEntity. */
    type $Shape = transit_realtime.FeedEntity.$Properties;
  }

  /**
   * Properties of a TripUpdate.
   * @deprecated Use transit_realtime.TripUpdate.$Properties instead.
   */
  interface ITripUpdate extends transit_realtime.TripUpdate.$Properties {}

  /** Represents a TripUpdate. */
  class TripUpdate {
    /**
     * Constructs a new TripUpdate.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.TripUpdate.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** TripUpdate trip. */
    trip: transit_realtime.TripDescriptor.$Properties;

    /** TripUpdate vehicle. */
    vehicle?: transit_realtime.VehicleDescriptor.$Properties | null;

    /** TripUpdate stopTimeUpdate. */
    stopTimeUpdate: transit_realtime.TripUpdate.StopTimeUpdate.$Properties[];

    /** TripUpdate timestamp. */
    timestamp: number | Long;

    /** TripUpdate delay. */
    delay: number;

    /**
     * Creates a new TripUpdate instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TripUpdate instance
     */
    static create(
      properties: transit_realtime.TripUpdate.$Shape
    ): transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape;
    static create(
      properties?: transit_realtime.TripUpdate.$Properties
    ): transit_realtime.TripUpdate;

    /**
     * Encodes the specified TripUpdate message. Does not implicitly {@link transit_realtime.TripUpdate.verify|verify} messages.
     * @param message TripUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.TripUpdate.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified TripUpdate message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.verify|verify} messages.
     * @param message TripUpdate message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.TripUpdate.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a TripUpdate message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape} TripUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape;

    /**
     * Decodes a TripUpdate message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape} TripUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.TripUpdate & transit_realtime.TripUpdate.$Shape;

    /**
     * Verifies a TripUpdate message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TripUpdate message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TripUpdate
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.TripUpdate;

    /**
     * Creates a plain object from a TripUpdate message. Also converts values to other types if specified.
     * @param message TripUpdate
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.TripUpdate,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this TripUpdate to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for TripUpdate
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace TripUpdate {
    /** Properties of a TripUpdate. */
    interface $Properties {
      /** TripUpdate trip */
      trip: transit_realtime.TripDescriptor.$Properties;

      /** TripUpdate vehicle */
      vehicle?: transit_realtime.VehicleDescriptor.$Properties | null;

      /** TripUpdate stopTimeUpdate */
      stopTimeUpdate?:
        | transit_realtime.TripUpdate.StopTimeUpdate.$Properties[]
        | null;

      /** TripUpdate timestamp */
      timestamp?: number | Long | null;

      /** TripUpdate delay */
      delay?: number | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a TripUpdate. */
    type $Shape = transit_realtime.TripUpdate.$Properties;

    /**
     * Properties of a StopTimeEvent.
     * @deprecated Use transit_realtime.TripUpdate.StopTimeEvent.$Properties instead.
     */
    interface IStopTimeEvent
      extends transit_realtime.TripUpdate.StopTimeEvent.$Properties {}

    /** Represents a StopTimeEvent. */
    class StopTimeEvent {
      /**
       * Constructs a new StopTimeEvent.
       * @param [properties] Properties to set
       */
      constructor(
        properties?: transit_realtime.TripUpdate.StopTimeEvent.$Properties
      );

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];

      /** StopTimeEvent delay. */
      delay: number;

      /** StopTimeEvent time. */
      time: number | Long;

      /** StopTimeEvent uncertainty. */
      uncertainty: number;

      /**
       * Creates a new StopTimeEvent instance using the specified properties.
       * @param [properties] Properties to set
       * @returns StopTimeEvent instance
       */
      static create(
        properties: transit_realtime.TripUpdate.StopTimeEvent.$Shape
      ): transit_realtime.TripUpdate.StopTimeEvent &
        transit_realtime.TripUpdate.StopTimeEvent.$Shape;
      static create(
        properties?: transit_realtime.TripUpdate.StopTimeEvent.$Properties
      ): transit_realtime.TripUpdate.StopTimeEvent;

      /**
       * Encodes the specified StopTimeEvent message. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeEvent.verify|verify} messages.
       * @param message StopTimeEvent message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encode(
        message: transit_realtime.TripUpdate.StopTimeEvent.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified StopTimeEvent message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeEvent.verify|verify} messages.
       * @param message StopTimeEvent message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encodeDelimited(
        message: transit_realtime.TripUpdate.StopTimeEvent.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a StopTimeEvent message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns {transit_realtime.TripUpdate.StopTimeEvent & transit_realtime.TripUpdate.StopTimeEvent.$Shape} StopTimeEvent
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): transit_realtime.TripUpdate.StopTimeEvent &
        transit_realtime.TripUpdate.StopTimeEvent.$Shape;

      /**
       * Decodes a StopTimeEvent message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns {transit_realtime.TripUpdate.StopTimeEvent & transit_realtime.TripUpdate.StopTimeEvent.$Shape} StopTimeEvent
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): transit_realtime.TripUpdate.StopTimeEvent &
        transit_realtime.TripUpdate.StopTimeEvent.$Shape;

      /**
       * Verifies a StopTimeEvent message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a StopTimeEvent message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns StopTimeEvent
       */
      static fromObject(object: {
        [k: string]: any;
      }): transit_realtime.TripUpdate.StopTimeEvent;

      /**
       * Creates a plain object from a StopTimeEvent message. Also converts values to other types if specified.
       * @param message StopTimeEvent
       * @param [options] Conversion options
       * @returns Plain object
       */
      static toObject(
        message: transit_realtime.TripUpdate.StopTimeEvent,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this StopTimeEvent to JSON.
       * @returns JSON object
       */
      toJSON(): { [k: string]: any };

      /**
       * Gets the type url for StopTimeEvent
       * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
       * @returns The type url
       */
      static getTypeUrl(prefix?: string): string;
    }

    namespace StopTimeEvent {
      /** Properties of a StopTimeEvent. */
      interface $Properties {
        /** StopTimeEvent delay */
        delay?: number | null;

        /** StopTimeEvent time */
        time?: number | Long | null;

        /** StopTimeEvent uncertainty */
        uncertainty?: number | null;

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
      }

      /** Shape of a StopTimeEvent. */
      type $Shape = transit_realtime.TripUpdate.StopTimeEvent.$Properties;
    }

    /**
     * Properties of a StopTimeUpdate.
     * @deprecated Use transit_realtime.TripUpdate.StopTimeUpdate.$Properties instead.
     */
    interface IStopTimeUpdate
      extends transit_realtime.TripUpdate.StopTimeUpdate.$Properties {}

    /** Represents a StopTimeUpdate. */
    class StopTimeUpdate {
      /**
       * Constructs a new StopTimeUpdate.
       * @param [properties] Properties to set
       */
      constructor(
        properties?: transit_realtime.TripUpdate.StopTimeUpdate.$Properties
      );

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];

      /** StopTimeUpdate stopSequence. */
      stopSequence: number;

      /** StopTimeUpdate stopId. */
      stopId: string;

      /** StopTimeUpdate arrival. */
      arrival?: transit_realtime.TripUpdate.StopTimeEvent.$Properties | null;

      /** StopTimeUpdate departure. */
      departure?: transit_realtime.TripUpdate.StopTimeEvent.$Properties | null;

      /** StopTimeUpdate scheduleRelationship. */
      scheduleRelationship: transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship;

      /**
       * Creates a new StopTimeUpdate instance using the specified properties.
       * @param [properties] Properties to set
       * @returns StopTimeUpdate instance
       */
      static create(
        properties: transit_realtime.TripUpdate.StopTimeUpdate.$Shape
      ): transit_realtime.TripUpdate.StopTimeUpdate &
        transit_realtime.TripUpdate.StopTimeUpdate.$Shape;
      static create(
        properties?: transit_realtime.TripUpdate.StopTimeUpdate.$Properties
      ): transit_realtime.TripUpdate.StopTimeUpdate;

      /**
       * Encodes the specified StopTimeUpdate message. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.verify|verify} messages.
       * @param message StopTimeUpdate message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encode(
        message: transit_realtime.TripUpdate.StopTimeUpdate.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified StopTimeUpdate message, length delimited. Does not implicitly {@link transit_realtime.TripUpdate.StopTimeUpdate.verify|verify} messages.
       * @param message StopTimeUpdate message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encodeDelimited(
        message: transit_realtime.TripUpdate.StopTimeUpdate.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a StopTimeUpdate message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns {transit_realtime.TripUpdate.StopTimeUpdate & transit_realtime.TripUpdate.StopTimeUpdate.$Shape} StopTimeUpdate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): transit_realtime.TripUpdate.StopTimeUpdate &
        transit_realtime.TripUpdate.StopTimeUpdate.$Shape;

      /**
       * Decodes a StopTimeUpdate message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns {transit_realtime.TripUpdate.StopTimeUpdate & transit_realtime.TripUpdate.StopTimeUpdate.$Shape} StopTimeUpdate
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): transit_realtime.TripUpdate.StopTimeUpdate &
        transit_realtime.TripUpdate.StopTimeUpdate.$Shape;

      /**
       * Verifies a StopTimeUpdate message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a StopTimeUpdate message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns StopTimeUpdate
       */
      static fromObject(object: {
        [k: string]: any;
      }): transit_realtime.TripUpdate.StopTimeUpdate;

      /**
       * Creates a plain object from a StopTimeUpdate message. Also converts values to other types if specified.
       * @param message StopTimeUpdate
       * @param [options] Conversion options
       * @returns Plain object
       */
      static toObject(
        message: transit_realtime.TripUpdate.StopTimeUpdate,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this StopTimeUpdate to JSON.
       * @returns JSON object
       */
      toJSON(): { [k: string]: any };

      /**
       * Gets the type url for StopTimeUpdate
       * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
       * @returns The type url
       */
      static getTypeUrl(prefix?: string): string;
    }

    namespace StopTimeUpdate {
      /** Properties of a StopTimeUpdate. */
      interface $Properties {
        /** StopTimeUpdate stopSequence */
        stopSequence?: number | null;

        /** StopTimeUpdate stopId */
        stopId?: string | null;

        /** StopTimeUpdate arrival */
        arrival?: transit_realtime.TripUpdate.StopTimeEvent.$Properties | null;

        /** StopTimeUpdate departure */
        departure?: transit_realtime.TripUpdate.StopTimeEvent.$Properties | null;

        /** StopTimeUpdate scheduleRelationship */
        scheduleRelationship?: transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship | null;

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
      }

      /** Shape of a StopTimeUpdate. */
      type $Shape = transit_realtime.TripUpdate.StopTimeUpdate.$Properties;

      /** ScheduleRelationship enum. */
      enum ScheduleRelationship {
        /** SCHEDULED value */
        SCHEDULED = 0,

        /** SKIPPED value */
        SKIPPED = 1,

        /** NO_DATA value */
        NO_DATA = 2,
      }
    }
  }

  /**
   * Properties of a VehiclePosition.
   * @deprecated Use transit_realtime.VehiclePosition.$Properties instead.
   */
  interface IVehiclePosition
    extends transit_realtime.VehiclePosition.$Properties {}

  /** Represents a VehiclePosition. */
  class VehiclePosition {
    /**
     * Constructs a new VehiclePosition.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.VehiclePosition.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** VehiclePosition trip. */
    trip?: transit_realtime.TripDescriptor.$Properties | null;

    /** VehiclePosition vehicle. */
    vehicle?: transit_realtime.VehicleDescriptor.$Properties | null;

    /** VehiclePosition position. */
    position?: transit_realtime.Position.$Properties | null;

    /** VehiclePosition currentStopSequence. */
    currentStopSequence: number;

    /** VehiclePosition stopId. */
    stopId: string;

    /** VehiclePosition currentStatus. */
    currentStatus: transit_realtime.VehiclePosition.VehicleStopStatus;

    /** VehiclePosition timestamp. */
    timestamp: number | Long;

    /** VehiclePosition congestionLevel. */
    congestionLevel: transit_realtime.VehiclePosition.CongestionLevel;

    /** VehiclePosition occupancyStatus. */
    occupancyStatus: transit_realtime.VehiclePosition.OccupancyStatus;

    /**
     * Creates a new VehiclePosition instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VehiclePosition instance
     */
    static create(
      properties: transit_realtime.VehiclePosition.$Shape
    ): transit_realtime.VehiclePosition &
      transit_realtime.VehiclePosition.$Shape;
    static create(
      properties?: transit_realtime.VehiclePosition.$Properties
    ): transit_realtime.VehiclePosition;

    /**
     * Encodes the specified VehiclePosition message. Does not implicitly {@link transit_realtime.VehiclePosition.verify|verify} messages.
     * @param message VehiclePosition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.VehiclePosition.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified VehiclePosition message, length delimited. Does not implicitly {@link transit_realtime.VehiclePosition.verify|verify} messages.
     * @param message VehiclePosition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.VehiclePosition.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a VehiclePosition message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.VehiclePosition & transit_realtime.VehiclePosition.$Shape} VehiclePosition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.VehiclePosition &
      transit_realtime.VehiclePosition.$Shape;

    /**
     * Decodes a VehiclePosition message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.VehiclePosition & transit_realtime.VehiclePosition.$Shape} VehiclePosition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.VehiclePosition &
      transit_realtime.VehiclePosition.$Shape;

    /**
     * Verifies a VehiclePosition message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a VehiclePosition message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VehiclePosition
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.VehiclePosition;

    /**
     * Creates a plain object from a VehiclePosition message. Also converts values to other types if specified.
     * @param message VehiclePosition
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.VehiclePosition,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this VehiclePosition to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for VehiclePosition
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace VehiclePosition {
    /** Properties of a VehiclePosition. */
    interface $Properties {
      /** VehiclePosition trip */
      trip?: transit_realtime.TripDescriptor.$Properties | null;

      /** VehiclePosition vehicle */
      vehicle?: transit_realtime.VehicleDescriptor.$Properties | null;

      /** VehiclePosition position */
      position?: transit_realtime.Position.$Properties | null;

      /** VehiclePosition currentStopSequence */
      currentStopSequence?: number | null;

      /** VehiclePosition stopId */
      stopId?: string | null;

      /** VehiclePosition currentStatus */
      currentStatus?: transit_realtime.VehiclePosition.VehicleStopStatus | null;

      /** VehiclePosition timestamp */
      timestamp?: number | Long | null;

      /** VehiclePosition congestionLevel */
      congestionLevel?: transit_realtime.VehiclePosition.CongestionLevel | null;

      /** VehiclePosition occupancyStatus */
      occupancyStatus?: transit_realtime.VehiclePosition.OccupancyStatus | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a VehiclePosition. */
    type $Shape = transit_realtime.VehiclePosition.$Properties;

    /** VehicleStopStatus enum. */
    enum VehicleStopStatus {
      /** INCOMING_AT value */
      INCOMING_AT = 0,

      /** STOPPED_AT value */
      STOPPED_AT = 1,

      /** IN_TRANSIT_TO value */
      IN_TRANSIT_TO = 2,
    }

    /** CongestionLevel enum. */
    enum CongestionLevel {
      /** UNKNOWN_CONGESTION_LEVEL value */
      UNKNOWN_CONGESTION_LEVEL = 0,

      /** RUNNING_SMOOTHLY value */
      RUNNING_SMOOTHLY = 1,

      /** STOP_AND_GO value */
      STOP_AND_GO = 2,

      /** CONGESTION value */
      CONGESTION = 3,

      /** SEVERE_CONGESTION value */
      SEVERE_CONGESTION = 4,
    }

    /** OccupancyStatus enum. */
    enum OccupancyStatus {
      /** EMPTY value */
      EMPTY = 0,

      /** MANY_SEATS_AVAILABLE value */
      MANY_SEATS_AVAILABLE = 1,

      /** FEW_SEATS_AVAILABLE value */
      FEW_SEATS_AVAILABLE = 2,

      /** STANDING_ROOM_ONLY value */
      STANDING_ROOM_ONLY = 3,

      /** CRUSHED_STANDING_ROOM_ONLY value */
      CRUSHED_STANDING_ROOM_ONLY = 4,

      /** FULL value */
      FULL = 5,

      /** NOT_ACCEPTING_PASSENGERS value */
      NOT_ACCEPTING_PASSENGERS = 6,
    }
  }

  /**
   * Properties of an Alert.
   * @deprecated Use transit_realtime.Alert.$Properties instead.
   */
  interface IAlert extends transit_realtime.Alert.$Properties {}

  /** Represents an Alert. */
  class Alert {
    /**
     * Constructs a new Alert.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.Alert.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** Alert activePeriod. */
    activePeriod: transit_realtime.TimeRange.$Properties[];

    /** Alert informedEntity. */
    informedEntity: transit_realtime.EntitySelector.$Properties[];

    /** Alert cause. */
    cause: transit_realtime.Alert.Cause;

    /** Alert effect. */
    effect: transit_realtime.Alert.Effect;

    /** Alert url. */
    url?: transit_realtime.TranslatedString.$Properties | null;

    /** Alert headerText. */
    headerText?: transit_realtime.TranslatedString.$Properties | null;

    /** Alert descriptionText. */
    descriptionText?: transit_realtime.TranslatedString.$Properties | null;

    /**
     * Creates a new Alert instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Alert instance
     */
    static create(
      properties: transit_realtime.Alert.$Shape
    ): transit_realtime.Alert & transit_realtime.Alert.$Shape;
    static create(
      properties?: transit_realtime.Alert.$Properties
    ): transit_realtime.Alert;

    /**
     * Encodes the specified Alert message. Does not implicitly {@link transit_realtime.Alert.verify|verify} messages.
     * @param message Alert message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.Alert.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified Alert message, length delimited. Does not implicitly {@link transit_realtime.Alert.verify|verify} messages.
     * @param message Alert message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.Alert.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an Alert message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.Alert & transit_realtime.Alert.$Shape} Alert
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.Alert & transit_realtime.Alert.$Shape;

    /**
     * Decodes an Alert message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.Alert & transit_realtime.Alert.$Shape} Alert
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.Alert & transit_realtime.Alert.$Shape;

    /**
     * Verifies an Alert message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an Alert message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Alert
     */
    static fromObject(object: { [k: string]: any }): transit_realtime.Alert;

    /**
     * Creates a plain object from an Alert message. Also converts values to other types if specified.
     * @param message Alert
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.Alert,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Alert to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for Alert
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace Alert {
    /** Properties of an Alert. */
    interface $Properties {
      /** Alert activePeriod */
      activePeriod?: transit_realtime.TimeRange.$Properties[] | null;

      /** Alert informedEntity */
      informedEntity?: transit_realtime.EntitySelector.$Properties[] | null;

      /** Alert cause */
      cause?: transit_realtime.Alert.Cause | null;

      /** Alert effect */
      effect?: transit_realtime.Alert.Effect | null;

      /** Alert url */
      url?: transit_realtime.TranslatedString.$Properties | null;

      /** Alert headerText */
      headerText?: transit_realtime.TranslatedString.$Properties | null;

      /** Alert descriptionText */
      descriptionText?: transit_realtime.TranslatedString.$Properties | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of an Alert. */
    type $Shape = transit_realtime.Alert.$Properties;

    /** Cause enum. */
    enum Cause {
      /** UNKNOWN_CAUSE value */
      UNKNOWN_CAUSE = 1,

      /** OTHER_CAUSE value */
      OTHER_CAUSE = 2,

      /** TECHNICAL_PROBLEM value */
      TECHNICAL_PROBLEM = 3,

      /** STRIKE value */
      STRIKE = 4,

      /** DEMONSTRATION value */
      DEMONSTRATION = 5,

      /** ACCIDENT value */
      ACCIDENT = 6,

      /** HOLIDAY value */
      HOLIDAY = 7,

      /** WEATHER value */
      WEATHER = 8,

      /** MAINTENANCE value */
      MAINTENANCE = 9,

      /** CONSTRUCTION value */
      CONSTRUCTION = 10,

      /** POLICE_ACTIVITY value */
      POLICE_ACTIVITY = 11,

      /** MEDICAL_EMERGENCY value */
      MEDICAL_EMERGENCY = 12,
    }

    /** Effect enum. */
    enum Effect {
      /** NO_SERVICE value */
      NO_SERVICE = 1,

      /** REDUCED_SERVICE value */
      REDUCED_SERVICE = 2,

      /** SIGNIFICANT_DELAYS value */
      SIGNIFICANT_DELAYS = 3,

      /** DETOUR value */
      DETOUR = 4,

      /** ADDITIONAL_SERVICE value */
      ADDITIONAL_SERVICE = 5,

      /** MODIFIED_SERVICE value */
      MODIFIED_SERVICE = 6,

      /** OTHER_EFFECT value */
      OTHER_EFFECT = 7,

      /** UNKNOWN_EFFECT value */
      UNKNOWN_EFFECT = 8,

      /** STOP_MOVED value */
      STOP_MOVED = 9,
    }
  }

  /**
   * Properties of a TimeRange.
   * @deprecated Use transit_realtime.TimeRange.$Properties instead.
   */
  interface ITimeRange extends transit_realtime.TimeRange.$Properties {}

  /** Represents a TimeRange. */
  class TimeRange {
    /**
     * Constructs a new TimeRange.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.TimeRange.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** TimeRange start. */
    start: number | Long;

    /** TimeRange end. */
    end: number | Long;

    /**
     * Creates a new TimeRange instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TimeRange instance
     */
    static create(
      properties: transit_realtime.TimeRange.$Shape
    ): transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape;
    static create(
      properties?: transit_realtime.TimeRange.$Properties
    ): transit_realtime.TimeRange;

    /**
     * Encodes the specified TimeRange message. Does not implicitly {@link transit_realtime.TimeRange.verify|verify} messages.
     * @param message TimeRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.TimeRange.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified TimeRange message, length delimited. Does not implicitly {@link transit_realtime.TimeRange.verify|verify} messages.
     * @param message TimeRange message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.TimeRange.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a TimeRange message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape} TimeRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape;

    /**
     * Decodes a TimeRange message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape} TimeRange
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.TimeRange & transit_realtime.TimeRange.$Shape;

    /**
     * Verifies a TimeRange message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TimeRange message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TimeRange
     */
    static fromObject(object: { [k: string]: any }): transit_realtime.TimeRange;

    /**
     * Creates a plain object from a TimeRange message. Also converts values to other types if specified.
     * @param message TimeRange
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.TimeRange,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this TimeRange to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for TimeRange
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace TimeRange {
    /** Properties of a TimeRange. */
    interface $Properties {
      /** TimeRange start */
      start?: number | Long | null;

      /** TimeRange end */
      end?: number | Long | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a TimeRange. */
    type $Shape = transit_realtime.TimeRange.$Properties;
  }

  /**
   * Properties of a Position.
   * @deprecated Use transit_realtime.Position.$Properties instead.
   */
  interface IPosition extends transit_realtime.Position.$Properties {}

  /** Represents a Position. */
  class Position {
    /**
     * Constructs a new Position.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.Position.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** Position latitude. */
    latitude: number;

    /** Position longitude. */
    longitude: number;

    /** Position bearing. */
    bearing: number;

    /** Position odometer. */
    odometer: number;

    /** Position speed. */
    speed: number;

    /**
     * Creates a new Position instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Position instance
     */
    static create(
      properties: transit_realtime.Position.$Shape
    ): transit_realtime.Position & transit_realtime.Position.$Shape;
    static create(
      properties?: transit_realtime.Position.$Properties
    ): transit_realtime.Position;

    /**
     * Encodes the specified Position message. Does not implicitly {@link transit_realtime.Position.verify|verify} messages.
     * @param message Position message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.Position.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified Position message, length delimited. Does not implicitly {@link transit_realtime.Position.verify|verify} messages.
     * @param message Position message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.Position.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a Position message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.Position & transit_realtime.Position.$Shape} Position
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.Position & transit_realtime.Position.$Shape;

    /**
     * Decodes a Position message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.Position & transit_realtime.Position.$Shape} Position
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.Position & transit_realtime.Position.$Shape;

    /**
     * Verifies a Position message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a Position message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Position
     */
    static fromObject(object: { [k: string]: any }): transit_realtime.Position;

    /**
     * Creates a plain object from a Position message. Also converts values to other types if specified.
     * @param message Position
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.Position,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this Position to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for Position
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace Position {
    /** Properties of a Position. */
    interface $Properties {
      /** Position latitude */
      latitude: number;

      /** Position longitude */
      longitude: number;

      /** Position bearing */
      bearing?: number | null;

      /** Position odometer */
      odometer?: number | null;

      /** Position speed */
      speed?: number | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a Position. */
    type $Shape = transit_realtime.Position.$Properties;
  }

  /**
   * Properties of a TripDescriptor.
   * @deprecated Use transit_realtime.TripDescriptor.$Properties instead.
   */
  interface ITripDescriptor
    extends transit_realtime.TripDescriptor.$Properties {}

  /** Represents a TripDescriptor. */
  class TripDescriptor {
    /**
     * Constructs a new TripDescriptor.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.TripDescriptor.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** TripDescriptor tripId. */
    tripId: string;

    /** TripDescriptor routeId. */
    routeId: string;

    /** TripDescriptor directionId. */
    directionId: number;

    /** TripDescriptor startTime. */
    startTime: string;

    /** TripDescriptor startDate. */
    startDate: string;

    /** TripDescriptor scheduleRelationship. */
    scheduleRelationship: transit_realtime.TripDescriptor.ScheduleRelationship;

    /**
     * Creates a new TripDescriptor instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TripDescriptor instance
     */
    static create(
      properties: transit_realtime.TripDescriptor.$Shape
    ): transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape;
    static create(
      properties?: transit_realtime.TripDescriptor.$Properties
    ): transit_realtime.TripDescriptor;

    /**
     * Encodes the specified TripDescriptor message. Does not implicitly {@link transit_realtime.TripDescriptor.verify|verify} messages.
     * @param message TripDescriptor message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.TripDescriptor.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified TripDescriptor message, length delimited. Does not implicitly {@link transit_realtime.TripDescriptor.verify|verify} messages.
     * @param message TripDescriptor message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.TripDescriptor.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a TripDescriptor message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape} TripDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape;

    /**
     * Decodes a TripDescriptor message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape} TripDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.TripDescriptor & transit_realtime.TripDescriptor.$Shape;

    /**
     * Verifies a TripDescriptor message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TripDescriptor message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TripDescriptor
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.TripDescriptor;

    /**
     * Creates a plain object from a TripDescriptor message. Also converts values to other types if specified.
     * @param message TripDescriptor
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.TripDescriptor,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this TripDescriptor to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for TripDescriptor
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace TripDescriptor {
    /** Properties of a TripDescriptor. */
    interface $Properties {
      /** TripDescriptor tripId */
      tripId?: string | null;

      /** TripDescriptor routeId */
      routeId?: string | null;

      /** TripDescriptor directionId */
      directionId?: number | null;

      /** TripDescriptor startTime */
      startTime?: string | null;

      /** TripDescriptor startDate */
      startDate?: string | null;

      /** TripDescriptor scheduleRelationship */
      scheduleRelationship?: transit_realtime.TripDescriptor.ScheduleRelationship | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a TripDescriptor. */
    type $Shape = transit_realtime.TripDescriptor.$Properties;

    /** ScheduleRelationship enum. */
    enum ScheduleRelationship {
      /** SCHEDULED value */
      SCHEDULED = 0,

      /** ADDED value */
      ADDED = 1,

      /** UNSCHEDULED value */
      UNSCHEDULED = 2,

      /** CANCELED value */
      CANCELED = 3,
    }
  }

  /**
   * Properties of a VehicleDescriptor.
   * @deprecated Use transit_realtime.VehicleDescriptor.$Properties instead.
   */
  interface IVehicleDescriptor
    extends transit_realtime.VehicleDescriptor.$Properties {}

  /** Represents a VehicleDescriptor. */
  class VehicleDescriptor {
    /**
     * Constructs a new VehicleDescriptor.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.VehicleDescriptor.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** VehicleDescriptor id. */
    id: string;

    /** VehicleDescriptor label. */
    label: string;

    /** VehicleDescriptor licensePlate. */
    licensePlate: string;

    /**
     * Creates a new VehicleDescriptor instance using the specified properties.
     * @param [properties] Properties to set
     * @returns VehicleDescriptor instance
     */
    static create(
      properties: transit_realtime.VehicleDescriptor.$Shape
    ): transit_realtime.VehicleDescriptor &
      transit_realtime.VehicleDescriptor.$Shape;
    static create(
      properties?: transit_realtime.VehicleDescriptor.$Properties
    ): transit_realtime.VehicleDescriptor;

    /**
     * Encodes the specified VehicleDescriptor message. Does not implicitly {@link transit_realtime.VehicleDescriptor.verify|verify} messages.
     * @param message VehicleDescriptor message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.VehicleDescriptor.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified VehicleDescriptor message, length delimited. Does not implicitly {@link transit_realtime.VehicleDescriptor.verify|verify} messages.
     * @param message VehicleDescriptor message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.VehicleDescriptor.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a VehicleDescriptor message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.VehicleDescriptor & transit_realtime.VehicleDescriptor.$Shape} VehicleDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.VehicleDescriptor &
      transit_realtime.VehicleDescriptor.$Shape;

    /**
     * Decodes a VehicleDescriptor message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.VehicleDescriptor & transit_realtime.VehicleDescriptor.$Shape} VehicleDescriptor
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.VehicleDescriptor &
      transit_realtime.VehicleDescriptor.$Shape;

    /**
     * Verifies a VehicleDescriptor message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a VehicleDescriptor message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns VehicleDescriptor
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.VehicleDescriptor;

    /**
     * Creates a plain object from a VehicleDescriptor message. Also converts values to other types if specified.
     * @param message VehicleDescriptor
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.VehicleDescriptor,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this VehicleDescriptor to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for VehicleDescriptor
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace VehicleDescriptor {
    /** Properties of a VehicleDescriptor. */
    interface $Properties {
      /** VehicleDescriptor id */
      id?: string | null;

      /** VehicleDescriptor label */
      label?: string | null;

      /** VehicleDescriptor licensePlate */
      licensePlate?: string | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a VehicleDescriptor. */
    type $Shape = transit_realtime.VehicleDescriptor.$Properties;
  }

  /**
   * Properties of an EntitySelector.
   * @deprecated Use transit_realtime.EntitySelector.$Properties instead.
   */
  interface IEntitySelector
    extends transit_realtime.EntitySelector.$Properties {}

  /** Represents an EntitySelector. */
  class EntitySelector {
    /**
     * Constructs a new EntitySelector.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.EntitySelector.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** EntitySelector agencyId. */
    agencyId: string;

    /** EntitySelector routeId. */
    routeId: string;

    /** EntitySelector routeType. */
    routeType: number;

    /** EntitySelector trip. */
    trip?: transit_realtime.TripDescriptor.$Properties | null;

    /** EntitySelector stopId. */
    stopId: string;

    /**
     * Creates a new EntitySelector instance using the specified properties.
     * @param [properties] Properties to set
     * @returns EntitySelector instance
     */
    static create(
      properties: transit_realtime.EntitySelector.$Shape
    ): transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape;
    static create(
      properties?: transit_realtime.EntitySelector.$Properties
    ): transit_realtime.EntitySelector;

    /**
     * Encodes the specified EntitySelector message. Does not implicitly {@link transit_realtime.EntitySelector.verify|verify} messages.
     * @param message EntitySelector message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.EntitySelector.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified EntitySelector message, length delimited. Does not implicitly {@link transit_realtime.EntitySelector.verify|verify} messages.
     * @param message EntitySelector message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.EntitySelector.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes an EntitySelector message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape} EntitySelector
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape;

    /**
     * Decodes an EntitySelector message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape} EntitySelector
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.EntitySelector & transit_realtime.EntitySelector.$Shape;

    /**
     * Verifies an EntitySelector message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates an EntitySelector message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns EntitySelector
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.EntitySelector;

    /**
     * Creates a plain object from an EntitySelector message. Also converts values to other types if specified.
     * @param message EntitySelector
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.EntitySelector,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this EntitySelector to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for EntitySelector
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace EntitySelector {
    /** Properties of an EntitySelector. */
    interface $Properties {
      /** EntitySelector agencyId */
      agencyId?: string | null;

      /** EntitySelector routeId */
      routeId?: string | null;

      /** EntitySelector routeType */
      routeType?: number | null;

      /** EntitySelector trip */
      trip?: transit_realtime.TripDescriptor.$Properties | null;

      /** EntitySelector stopId */
      stopId?: string | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of an EntitySelector. */
    type $Shape = transit_realtime.EntitySelector.$Properties;
  }

  /**
   * Properties of a TranslatedString.
   * @deprecated Use transit_realtime.TranslatedString.$Properties instead.
   */
  interface ITranslatedString
    extends transit_realtime.TranslatedString.$Properties {}

  /** Represents a TranslatedString. */
  class TranslatedString {
    /**
     * Constructs a new TranslatedString.
     * @param [properties] Properties to set
     */
    constructor(properties?: transit_realtime.TranslatedString.$Properties);

    /** Unknown fields preserved while decoding */
    $unknowns?: Uint8Array[];

    /** TranslatedString translation. */
    translation: transit_realtime.TranslatedString.Translation.$Properties[];

    /**
     * Creates a new TranslatedString instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TranslatedString instance
     */
    static create(
      properties: transit_realtime.TranslatedString.$Shape
    ): transit_realtime.TranslatedString &
      transit_realtime.TranslatedString.$Shape;
    static create(
      properties?: transit_realtime.TranslatedString.$Properties
    ): transit_realtime.TranslatedString;

    /**
     * Encodes the specified TranslatedString message. Does not implicitly {@link transit_realtime.TranslatedString.verify|verify} messages.
     * @param message TranslatedString message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encode(
      message: transit_realtime.TranslatedString.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Encodes the specified TranslatedString message, length delimited. Does not implicitly {@link transit_realtime.TranslatedString.verify|verify} messages.
     * @param message TranslatedString message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    static encodeDelimited(
      message: transit_realtime.TranslatedString.$Properties,
      writer?: $protobuf.Writer
    ): $protobuf.Writer;

    /**
     * Decodes a TranslatedString message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns {transit_realtime.TranslatedString & transit_realtime.TranslatedString.$Shape} TranslatedString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decode(
      reader: $protobuf.Reader | Uint8Array,
      length?: number
    ): transit_realtime.TranslatedString &
      transit_realtime.TranslatedString.$Shape;

    /**
     * Decodes a TranslatedString message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns {transit_realtime.TranslatedString & transit_realtime.TranslatedString.$Shape} TranslatedString
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    static decodeDelimited(
      reader: $protobuf.Reader | Uint8Array
    ): transit_realtime.TranslatedString &
      transit_realtime.TranslatedString.$Shape;

    /**
     * Verifies a TranslatedString message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    static verify(message: { [k: string]: any }): string | null;

    /**
     * Creates a TranslatedString message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TranslatedString
     */
    static fromObject(object: {
      [k: string]: any;
    }): transit_realtime.TranslatedString;

    /**
     * Creates a plain object from a TranslatedString message. Also converts values to other types if specified.
     * @param message TranslatedString
     * @param [options] Conversion options
     * @returns Plain object
     */
    static toObject(
      message: transit_realtime.TranslatedString,
      options?: $protobuf.IConversionOptions
    ): { [k: string]: any };

    /**
     * Converts this TranslatedString to JSON.
     * @returns JSON object
     */
    toJSON(): { [k: string]: any };

    /**
     * Gets the type url for TranslatedString
     * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
     * @returns The type url
     */
    static getTypeUrl(prefix?: string): string;
  }

  namespace TranslatedString {
    /** Properties of a TranslatedString. */
    interface $Properties {
      /** TranslatedString translation */
      translation?:
        | transit_realtime.TranslatedString.Translation.$Properties[]
        | null;

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];
    }

    /** Shape of a TranslatedString. */
    type $Shape = transit_realtime.TranslatedString.$Properties;

    /**
     * Properties of a Translation.
     * @deprecated Use transit_realtime.TranslatedString.Translation.$Properties instead.
     */
    interface ITranslation
      extends transit_realtime.TranslatedString.Translation.$Properties {}

    /** Represents a Translation. */
    class Translation {
      /**
       * Constructs a new Translation.
       * @param [properties] Properties to set
       */
      constructor(
        properties?: transit_realtime.TranslatedString.Translation.$Properties
      );

      /** Unknown fields preserved while decoding */
      $unknowns?: Uint8Array[];

      /** Translation text. */
      text: string;

      /** Translation language. */
      language: string;

      /**
       * Creates a new Translation instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Translation instance
       */
      static create(
        properties: transit_realtime.TranslatedString.Translation.$Shape
      ): transit_realtime.TranslatedString.Translation &
        transit_realtime.TranslatedString.Translation.$Shape;
      static create(
        properties?: transit_realtime.TranslatedString.Translation.$Properties
      ): transit_realtime.TranslatedString.Translation;

      /**
       * Encodes the specified Translation message. Does not implicitly {@link transit_realtime.TranslatedString.Translation.verify|verify} messages.
       * @param message Translation message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encode(
        message: transit_realtime.TranslatedString.Translation.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Encodes the specified Translation message, length delimited. Does not implicitly {@link transit_realtime.TranslatedString.Translation.verify|verify} messages.
       * @param message Translation message or plain object to encode
       * @param [writer] Writer to encode to
       * @returns Writer
       */
      static encodeDelimited(
        message: transit_realtime.TranslatedString.Translation.$Properties,
        writer?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Translation message from the specified reader or buffer.
       * @param reader Reader or buffer to decode from
       * @param [length] Message length if known beforehand
       * @returns {transit_realtime.TranslatedString.Translation & transit_realtime.TranslatedString.Translation.$Shape} Translation
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decode(
        reader: $protobuf.Reader | Uint8Array,
        length?: number
      ): transit_realtime.TranslatedString.Translation &
        transit_realtime.TranslatedString.Translation.$Shape;

      /**
       * Decodes a Translation message from the specified reader or buffer, length delimited.
       * @param reader Reader or buffer to decode from
       * @returns {transit_realtime.TranslatedString.Translation & transit_realtime.TranslatedString.Translation.$Shape} Translation
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      static decodeDelimited(
        reader: $protobuf.Reader | Uint8Array
      ): transit_realtime.TranslatedString.Translation &
        transit_realtime.TranslatedString.Translation.$Shape;

      /**
       * Verifies a Translation message.
       * @param message Plain object to verify
       * @returns `null` if valid, otherwise the reason why it is not
       */
      static verify(message: { [k: string]: any }): string | null;

      /**
       * Creates a Translation message from a plain object. Also converts values to their respective internal types.
       * @param object Plain object
       * @returns Translation
       */
      static fromObject(object: {
        [k: string]: any;
      }): transit_realtime.TranslatedString.Translation;

      /**
       * Creates a plain object from a Translation message. Also converts values to other types if specified.
       * @param message Translation
       * @param [options] Conversion options
       * @returns Plain object
       */
      static toObject(
        message: transit_realtime.TranslatedString.Translation,
        options?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Translation to JSON.
       * @returns JSON object
       */
      toJSON(): { [k: string]: any };

      /**
       * Gets the type url for Translation
       * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
       * @returns The type url
       */
      static getTypeUrl(prefix?: string): string;
    }

    namespace Translation {
      /** Properties of a Translation. */
      interface $Properties {
        /** Translation text */
        text: string;

        /** Translation language */
        language?: string | null;

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];
      }

      /** Shape of a Translation. */
      type $Shape = transit_realtime.TranslatedString.Translation.$Properties;
    }
  }
}
