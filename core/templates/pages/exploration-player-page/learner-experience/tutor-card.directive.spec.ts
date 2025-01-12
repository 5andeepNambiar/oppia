// Copyright 2021 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS-IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Unit tests for the Tutor Card directive.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { importAllAngularServices } from 'tests/unit-test-utils.ajs';
// ^^^ This block is to be removed.
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { Interaction } from 'domain/exploration/InteractionObjectFactory';
import { RecordedVoiceovers } from 'domain/exploration/recorded-voiceovers.model';
import { WrittenTranslationsObjectFactory } from 'domain/exploration/WrittenTranslationsObjectFactory';
import { StateCard } from 'domain/state_card/state-card.model';
import { UrlInterpolationService } from 'domain/utilities/url-interpolation.service';
import { AutogeneratedAudioPlayerService } from 'services/autogenerated-audio-player.service';
import { ContextService } from 'services/context.service';
import { DeviceInfoService } from 'services/contextual/device-info.service';
import { UserService } from 'services/user.service';
import { AudioTranslationLanguageService } from '../services/audio-translation-language.service';
import { AudioTranslationManagerService } from '../services/audio-translation-manager.service';
import { CurrentInteractionService } from '../services/current-interaction.service';
import { ExplorationPlayerStateService } from '../services/exploration-player-state.service';
import { LearnerAnswerInfoService } from '../services/learner-answer-info.service';
import { PlayerPositionService } from '../services/player-position.service';
import { WindowDimensionsService } from 'services/contextual/window-dimensions.service';

describe('Tutor Card directive', function() {
  beforeEach(angular.mock.module('oppia'));

  importAllAngularServices();
  let $scope = null;
  let ctrl = null;
  let $rootScope = null;
  let directive = null;
  let audioTranslationLanguageService: AudioTranslationLanguageService = null;
  let audioTranslationManagerService: AudioTranslationManagerService = null;
  let autogeneratedAudioPlayerService: AutogeneratedAudioPlayerService = null;
  let contextService: ContextService = null;
  let currentInteractionService: CurrentInteractionService = null;
  let deviceInfoService: DeviceInfoService = null;
  let explorationPlayerStateService: ExplorationPlayerStateService = null;
  let learnerAnswerInfoService: LearnerAnswerInfoService = null;
  let playerPositionService: PlayerPositionService = null;
  let userService: UserService = null;
  let urlInterpolationService: UrlInterpolationService = null;
  let interactionObjectFactory = null;
  let windowDimensionsService: WindowDimensionsService;
  let writtenTranslationsObjectFactory: WrittenTranslationsObjectFactory = null;

  let testSubscriptions: Subscription = null;
  let $anchorScroll = jasmine.createSpy('anchorScroll');
  let sampleCard: StateCard = null;
  let feedbackSpy = jasmine.createSpy('oppiaFeedbackAvailable');
  let interaction: Interaction = null;
  let oppiaFeedbackEmitter = new EventEmitter();
  let activeCardChangedEmitter = new EventEmitter();
  let newCardAvailableEmitter = new EventEmitter();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LearnerAnswerInfoService
      ]
    });
  });

  beforeEach(angular.mock.inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();

    audioTranslationManagerService = $injector.get(
      'AudioTranslationManagerService');
    audioTranslationLanguageService = $injector.get(
      'AudioTranslationLanguageService');
    autogeneratedAudioPlayerService = $injector.get(
      'AutogeneratedAudioPlayerService');
    contextService = $injector.get('ContextService');
    currentInteractionService = $injector.get('CurrentInteractionService');
    deviceInfoService = $injector.get('DeviceInfoService');
    explorationPlayerStateService = $injector.get(
      'ExplorationPlayerStateService');
    learnerAnswerInfoService = TestBed.inject(LearnerAnswerInfoService);
    userService = $injector.get('UserService');
    urlInterpolationService = $injector.get('UrlInterpolationService');
    writtenTranslationsObjectFactory = $injector.get(
      'WrittenTranslationsObjectFactory');
    windowDimensionsService = $injector.get('WindowDimensionsService');
    playerPositionService = $injector.get('PlayerPositionService');
    interactionObjectFactory = $injector.get('InteractionObjectFactory');

    interaction = interactionObjectFactory.createFromBackendDict({
      id: 'TextInput',
      answer_groups: [
        {
          outcome: {
            dest: 'State',
            feedback: {
              html: '',
              content_id: 'This is a new feedback text',
            },
            refresher_exploration_id: 'test',
            missing_prerequisite_skill_id: 'test_skill_id',
            labelled_as_correct: true,
            param_changes: [],
          },
          rule_specs: [],
          training_data: [],
          tagged_skill_misconception_id: '',
        },
      ],
      default_outcome: {
        dest: 'Hola',
        feedback: {
          content_id: '',
          html: '',
        },
        labelled_as_correct: true,
        param_changes: [],
        refresher_exploration_id: 'test',
        missing_prerequisite_skill_id: 'test_skill_id',
      },
      confirmed_unclassified_answers: [],
      customization_args: {
        rows: {
          value: true,
        },
        placeholder: {
          value: 1,
        },
      },
      hints: [],
      solution: {
        answer_is_exclusive: true,
        correct_answer: 'test_answer',
        explanation: {
          content_id: '2',
          html: 'test_explanation1',
        },
      },
    });

    let voiceOversDict = {
      voiceovers_mapping: {
        content: {
          en: {
            filename: 'filename1.mp3',
            file_size_bytes: 100000,
            needs_update: false,
            duration_secs: 10.0
          },
          hi: {
            filename: 'filename2.mp3',
            file_size_bytes: 11000,
            needs_update: false,
            duration_secs: 0.11
          }
        },
        default_outcome: {
          en: {
            filename: 'filename3.mp3',
            file_size_bytes: 3000,
            needs_update: false,
            duration_secs: 0.33
          },
          hi: {
            filename: 'filename4.mp3',
            file_size_bytes: 5000,
            needs_update: false,
            duration_secs: 0.5
          }
        },
        feedback_1: {
          en: {
            filename: 'filename5.mp3',
            file_size_bytes: 2000,
            needs_update: false,
            duration_secs: 0.2
          },
          hi: {
            filename: 'filename6.mp3',
            file_size_bytes: 9000,
            needs_update: false,
            duration_secs: 0.9
          }
        },
        feedback_2: {
          en: {
            filename: 'filename7.mp3',
            file_size_bytes: 1000,
            needs_update: false,
            duration_secs: 0.1
          },
          hi: {
            filename: 'filename8.mp3',
            file_size_bytes: 600,
            needs_update: false,
            duration_secs: 0.06
          }
        },
        hint_1: {
          en: {
            filename: 'filename9.mp3',
            file_size_bytes: 104000,
            needs_update: false,
            duration_secs: 10.4
          },
          hi: {
            filename: 'filename10.mp3',
            file_size_bytes: 1000,
            needs_update: true,
            duration_secs: 0.1
          }
        },
        hint_2: {},
        solution: {
          en: {
            filename: 'filename13.mp3',
            file_size_bytes: 15080,
            needs_update: false,
            duration_secs: 1.5
          },
          hi: {
            filename: 'filename14.mp3',
            file_size_bytes: 10500,
            needs_update: false,
            duration_secs: 1.05
          }
        }
      }
    };

    sampleCard = StateCard.createNewCard(
      'State 1', '<p>Content</p>', '<interaction></interaction>',
      interaction, RecordedVoiceovers.createFromBackendDict(voiceOversDict),
      writtenTranslationsObjectFactory.createEmpty(),
      'content', audioTranslationLanguageService);
    spyOnProperty(explorationPlayerStateService, 'onOppiaFeedbackAvailable')
      .and.returnValue(oppiaFeedbackEmitter);
    spyOnProperty(playerPositionService, 'onActiveCardChanged').and.returnValue(
      activeCardChangedEmitter);
    spyOnProperty(playerPositionService, 'onNewCardAvailable').and.returnValue(
      newCardAvailableEmitter);
    spyOn(deviceInfoService, 'isMobileDevice').and.returnValue(true);
    spyOn(currentInteractionService, 'registerPresubmitHook')
      .and.callFake((cb) => {
        cb();
      });

    directive = $injector.get('tutorCardDirective')[0];

    ctrl = $injector.instantiate(directive.controller, {
      $scope: $scope,
      $rootScope: $scope,
      $anchorScroll: $anchorScroll,
      LearnerAnswerInfoService: learnerAnswerInfoService
    });

    $scope.getDisplayedCard = function() {
      return sampleCard;
    };
    $scope.getDisplayedCard().markAsCompleted();
  }));

  beforeEach(() => {
    testSubscriptions = new Subscription();
    testSubscriptions.add(
      explorationPlayerStateService.onOppiaFeedbackAvailable.subscribe(
        feedbackSpy));
  });

  afterEach(() => {
    testSubscriptions.unsubscribe();
    ctrl.$onDestroy();
  });

  describe('on initialization ', function() {
    it('should set profile picture from data url when ' +
      'user is not in editor preview mode', fakeAsync(function() {
      spyOn(contextService, 'isInExplorationEditorPage').and.returnValue(false);
      spyOn(userService, 'getProfileImageDataUrlAsync')
        .and.resolveTo('imageUrl');

      ctrl.$onInit();
      oppiaFeedbackEmitter.emit();
      activeCardChangedEmitter.emit();
      newCardAvailableEmitter.emit();
      tick();

      expect($scope.profilePicture).toBe('imageUrl');
    }));

    it('should set default profile picture when ' +
      'user is in editor preview mode', fakeAsync(function() {
      spyOn(contextService, 'isInExplorationEditorPage').and.returnValue(true);
      spyOn(urlInterpolationService, 'getStaticImageUrl')
        .and.returnValue('staticImage');

      ctrl.$onInit();
      oppiaFeedbackEmitter.emit();
      activeCardChangedEmitter.emit();
      newCardAvailableEmitter.emit();
      tick();

      expect($scope.profilePicture).toBe('staticImage');
    }));

    it('should check whether the audio bar is expanded on ' +
      'mobile device', fakeAsync(function() {
      spyOn(contextService, 'isInExplorationEditorPage')
        .and.returnValue(false);
      spyOn(userService, 'getProfileImageDataUrlAsync')
        .and.resolveTo('imageUrl');

      ctrl.$onInit();
      tick();
      let result = $scope.isAudioBarExpandedOnMobileDevice();

      expect(result).toBe(false);
    }));
  });

  it('should check whether the display card ' +
    'is non terminal when calling \'isOnTerminalCard(\'', function() {
    let result = $scope.isOnTerminalCard();

    expect(result).toBe(false);
  });

  it('should check whether the current card is end of transcript ' +
    'when calling \'isCurrentCardAtEndOfTranscript\'', function() {
    let result = $scope.isCurrentCardAtEndOfTranscript();

    expect(result).toBe(false);
  });

  it('should check whether the content audio translation ' +
    'is available when concept card is opened', function() {
    $scope.conceptCardIsBeingShown = true;

    let result = $scope.isContentAudioTranslationAvailable();

    expect(result).toBe(false);
  });

  it('should check whether the content audio translation ' +
    'is available when concept card is not opened', function() {
    $scope.conceptCardIsBeingShown = false;

    let result = $scope.isContentAudioTranslationAvailable();

    expect(result).toBe(true);
  });

  it('should check whether the interactions are ' +
    'in line when concept card is opened', function() {
    $scope.conceptCardIsBeingShown = true;

    let result = $scope.isInteractionInline();

    expect(result).toBe(true);
  });

  it('should check whether the interactions are ' +
    'in line when concept card is not opened', function() {
    $scope.conceptCardIsBeingShown = false;

    let result = $scope.isInteractionInline();

    expect(result).toBe(true);
  });

  it('should check whether the audio bar is opened', function() {
    let result = $scope.showAudioBar();

    expect(result).toBe(true);
  });

  it('should check whether the window can show two cards', function() {
    // Window can't show 2 cards if width is less than 960.
    let getWidthSpy = spyOn(windowDimensionsService, 'getWidth');
    getWidthSpy.and.returnValue(500);
    let result = $scope.canWindowShowTwoCards();
    expect(result).toBe(false);

    getWidthSpy.and.returnValue(1000);
    result = $scope.canWindowShowTwoCards();

    expect(result).toBe(true);
  });

  it('should check whether the window is narrow', function() {
    // Window is narrow if width is less than 768.
    let getWidthSpy = spyOn(windowDimensionsService, 'getWidth');
    getWidthSpy.and.returnValue(500);
    let result = $scope.isWindowNarrow();

    expect(result).toBe(true);

    getWidthSpy.and.returnValue(1000);
    result = $scope.isWindowNarrow();

    expect(result).toBe(false);
  });

  it('should toggle previous responses when ' +
    'callin \'toggleShowPreviousResponses\'', function() {
    $scope.arePreviousResponsesShown = false;

    $scope.toggleShowPreviousResponses();
    expect($scope.arePreviousResponsesShown).toBe(true);

    $scope.toggleShowPreviousResponses();
    expect($scope.arePreviousResponsesShown).toBe(false);
  });

  it('should return content focus labe when calling ' +
    '\'getContentFocusLabel\'', function() {
    let result = $scope.getContentFocusLabel();
    expect(result).toBe('content-focus-label-undefined');
  });

  it('should return audio highlight class ' +
    '\'getContentAudioHighlightClass\'', function() {
    spyOn(audioTranslationManagerService, 'getCurrentComponentName')
      .and.returnValue('content');
    spyOn(autogeneratedAudioPlayerService, 'isPlaying').and.returnValue(true);

    let result = $scope.getContentAudioHighlightClass();

    expect(result).toBe('conversation-skin-audio-highlight');
  });
});
