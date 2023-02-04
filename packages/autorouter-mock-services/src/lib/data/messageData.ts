import {
  FplBroughtForwardMessage, FplCancelledMessage,
  FplDelayedMessge,
  FplDesuspendedMessage,
  FplDpiUpdated,
  FplFiledMessage,
  FplMessage, FplMessageType,
  FplQueuedMessage,
  FplRejectedMessage,
  FplSlotAllocatedMessage,
  FplSlotCancelledMessage,
  FplSlotRevisedMessage,
  FplSsrAssignedMessage,
  FplSsrUpdatedMessage,
  FplStatusChangeMessage,
  FplSuspendedMessage,
  Status
} from 'autorouter-dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const baseMessage = {
  /* unique message ID, 64-bit unsigned integer, used to acknowledge the message */
  'id': 12345,
  /* the user ID, integer the message applies to */
  'uid': 1,
  /* timestamp in seconds since the Unix epoch from when the message originates */
  'timestamp': 1474191842,
  /* message type identifier */
  'type': 'fplan_status_changed',
  /* message specific data */
  'message':
    {}
};

export function buildFplStatusChangeMessage(fplId: number, previousStatus: Status, nextStatus: Status): FplStatusChangeMessage {
  return buildMessage<FplStatusChangeMessage>(FplMessageType.fplan_status_changed, fplId, {
    'status_previous': previousStatus,
    'status': nextStatus
  });
}

export function buildFplFiledMessage(fplId: number, refile: boolean): FplFiledMessage {
  return buildMessage<FplFiledMessage>(FplMessageType.fplan_filed, fplId, {
    refile: refile
  });
}

export function buildFplQueuedMessage(fplId: number, refile: boolean): FplQueuedMessage {
  return buildMessage<FplQueuedMessage>(FplMessageType.fplan_queued, fplId, {
    refile: refile
  });
}

export function buildFplRejectedMessage(fplId: number): FplRejectedMessage {
  return buildMessage<FplRejectedMessage>(FplMessageType.fplan_rejected, fplId, {
    errors: []
  });
}

export function buildFplSlotMessage(fplId: number, ctot: string, revision: boolean): FplSlotAllocatedMessage | FplSlotRevisedMessage {
  const subMessage = {
    'ctot': ctot,
    'regulations':
      [
        'LSZBA21M'
      ],
    'regcause':
      [
        'CE 81'
      ],
    'ttos':
      [
        {
          /* altitude in flight level */
          'fl': 'F090',
          /* target time over in HHMMZ */
          'to': '0746',
          /* ident of the point */
          'ptid': 'WIL'
        }
      ]
  };
  return revision
    ? buildMessage<FplSlotRevisedMessage>(FplMessageType.fplan_slot_revised, fplId, subMessage)
    : buildMessage<FplSlotAllocatedMessage>(FplMessageType.fplan_slot_allocated, fplId, subMessage);
}

export function buildFplSlotCancelledMessage(fplId: number): FplSlotCancelledMessage {
  return buildMessage<FplSlotCancelledMessage>(FplMessageType.fplan_slot_cancelled, fplId, {
    'reasons':
      [],
    'comments':
      []
  });
}

export function buildFplSuspendedMessage(fplId: number): FplSuspendedMessage {
  return buildMessage<FplSuspendedMessage>(FplMessageType.fplan_suspended, fplId, {
    comments: [],
    errors: [],
    newrte: []
  });
}

export function buildFplDesuspendedMessage(fplId: number): FplDesuspendedMessage {
  return buildMessage<FplDesuspendedMessage>(FplMessageType.fplan_desuspended, fplId, {});
}

export function buildFplSsrMessage(fplId: number, code: string, update: boolean): FplSsrAssignedMessage | FplSsrUpdatedMessage {
  const subMsg = {
    ssrcode: code
  };
  return update
    ? buildMessage<FplSsrUpdatedMessage>(FplMessageType.fplan_ssr_updated, fplId, subMsg)
    : buildMessage<FplSsrAssignedMessage>(FplMessageType.fplan_ssr_assigned, fplId, subMsg);
}

export function buildFplDelayedMessage(fplId: number, eobt: number, previousEobt: number): FplDelayedMessge {
  return buildMessage<FplDelayedMessge>(FplMessageType.fplan_delayed, fplId, {
    eobt, previous_eobt: previousEobt
  });
}

export function buildFplBroughtForwardMessage(fplId: number, eobt: number, previousFplId: number, previousEobt: number): FplBroughtForwardMessage {
  return buildMessage<FplBroughtForwardMessage>(FplMessageType.fplan_broughtforward, fplId, {
    eobt, previous_eobt: previousEobt, previous_fplid: previousFplId
  });
}

export function buildFplCancelledMessage(fplId: number, broughtForward = false): FplCancelledMessage {
  return buildMessage<FplCancelledMessage>(FplMessageType.fplan_cancelled, fplId, {
    reason: broughtForward ? 'FPL brought forward' : 'mock cancellation reason'
  });
}

export function buildFplDpiUpdatedMessage(fplId: number, tobt?: string, taxiTime?: string, ttot?: string, sid?: string): FplDpiUpdated {
  return buildMessage<FplDpiUpdated>(FplMessageType.fplan_dpi_updated, fplId, {
    /* target offblock time in hhmm UTC */
    'tobt': tobt,
    /* taxi time in minutes */
    'taxitime': taxiTime,
    /* target takeoff time in hhmm UTC */
    'ttot': ttot,
    /* assigned SID */
    'sid': sid
  });
}

function buildMessage<T extends FplMessage>(type: T['type'], fplId: number, subMsg: Omit<T['message'], 'fplid'>) {
  return {
    id: 0,
    uid: 1,
    timestamp: dayjs().utc().unix(),
    type: type,
    message: {
      'fplid': fplId,
      ...subMsg
    }
  };
}
