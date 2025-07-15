import json
import random
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from collections import defaultdict, Counter
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

import spacy
from spacy.tokens import DocBin
from spacy.training import Example
from spacy.scorer import Scorer


def convert_to_spacy_format(labeled_data):
    """
    Convert your labeled data format to spaCy training format
    """
    training_data = []

    for item in labeled_data:
        text = item["value"]
        entities = []

        # Convert labels to spaCy format (start, end, label)
        for label_info in item["label"]:
            start = label_info["start"]
            end = label_info["end"]
            # Use the first label if multiple labels exist
            entity_label = label_info["labels"][0]
            entities.append((start, end, entity_label))

        training_data.append((text, {"entities": entities}))

    return training_data


def create_training_examples(nlp, training_data):
    """
    Create spaCy Example objects for training
    """
    examples = []
    for text, annotations in training_data:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)
    return examples


def split_data(training_data, train_ratio=0.8):
    """
    Split data into training and validation sets
    """
    random.shuffle(training_data)
    split_idx = int(len(training_data) * train_ratio)
    train_data = training_data[:split_idx]
    val_data = training_data[split_idx:]
    return train_data, val_data


def evaluate_model(nlp, examples):
    """
    Evaluate model performance using spaCy's built-in scorer
    """
    scorer = Scorer()
    scores = scorer.score(examples)
    return scores


def get_entity_level_metrics(nlp, examples):
    """
    Calculate entity-level precision, recall, and F1 scores
    """
    true_entities = []
    pred_entities = []

    for example in examples:
        # Get true entities
        true_ents = [(ent.start_char, ent.end_char, ent.label_)
                     for ent in example.reference.ents]

        # Get predicted entities
        pred_doc = nlp(example.reference.text)
        pred_ents = [(ent.start_char, ent.end_char, ent.label_)
                     for ent in pred_doc.ents]

        true_entities.extend(true_ents)
        pred_entities.extend(pred_ents)

    # Calculate metrics per label
    all_labels = set([ent[2] for ent in true_entities + pred_entities])
    metrics = {}

    for label in all_labels:
        true_label = set([(ent[0], ent[1]) for ent in true_entities if ent[2] == label])
        pred_label = set([(ent[0], ent[1]) for ent in pred_entities if ent[2] == label])

        tp = len(true_label & pred_label)
        fp = len(pred_label - true_label)
        fn = len(true_label - pred_label)

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

        metrics[label] = {
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'support': len(true_label)
        }

    return metrics


def plot_training_progress(losses_history):
    """
    Plot training loss over iterations
    """
    plt.figure(figsize=(12, 6))

    plt.subplot(1, 2, 1)
    iterations = range(len(losses_history))
    plt.plot(iterations, losses_history)
    plt.title('Training Loss Over Time')
    plt.xlabel('Iteration')
    plt.ylabel('Loss')
    plt.grid(True)

    plt.subplot(1, 2, 2)
    # Smooth the loss curve
    if len(losses_history) > 10:
        window_size = min(10, len(losses_history) // 5)
        smoothed_losses = pd.Series(losses_history).rolling(window=window_size).mean()
        plt.plot(iterations, smoothed_losses, label=f'Smoothed (window={window_size})')
        plt.plot(iterations, losses_history, alpha=0.3, label='Raw')
        plt.legend()
    else:
        plt.plot(iterations, losses_history)

    plt.title('Smoothed Training Loss')
    plt.xlabel('Iteration')
    plt.ylabel('Loss')
    plt.grid(True)

    plt.tight_layout()
    plt.show()


def plot_entity_distribution(training_data):
    """
    Plot distribution of entity labels in training data
    """
    label_counts = Counter()

    for _, annotations in training_data:
        for _, _, label in annotations["entities"]:
            label_counts[label] += 1

    plt.figure(figsize=(10, 6))
    labels = list(label_counts.keys())
    counts = list(label_counts.values())

    plt.bar(labels, counts)
    plt.title('Entity Label Distribution in Training Data')
    plt.xlabel('Entity Labels')
    plt.ylabel('Count')
    plt.xticks(rotation=45)

    # Add count labels on bars
    for i, count in enumerate(counts):
        plt.text(i, count + 0.5, str(count), ha='center')

    plt.tight_layout()
    plt.show()

    return label_counts


def plot_performance_metrics(metrics):
    """
    Plot precision, recall, and F1 scores for each entity type
    """
    labels = list(metrics.keys())
    precision_scores = [metrics[label]['precision'] for label in labels]
    recall_scores = [metrics[label]['recall'] for label in labels]
    f1_scores = [metrics[label]['f1'] for label in labels]

    x = np.arange(len(labels))
    width = 0.25

    fig, ax = plt.subplots(figsize=(12, 6))

    bars1 = ax.bar(x - width, precision_scores, width, label='Precision', alpha=0.8)
    bars2 = ax.bar(x, recall_scores, width, label='Recall', alpha=0.8)
    bars3 = ax.bar(x + width, f1_scores, width, label='F1-Score', alpha=0.8)

    ax.set_xlabel('Entity Labels')
    ax.set_ylabel('Score')
    ax.set_title('Performance Metrics by Entity Type')
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=45)
    ax.legend()
    ax.set_ylim(0, 1)

    # Add value labels on bars
    def add_value_labels(bars):
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width() / 2., height + 0.01,
                    f'{height:.3f}', ha='center', va='bottom', fontsize=9)

    add_value_labels(bars1)
    add_value_labels(bars2)
    add_value_labels(bars3)

    plt.tight_layout()
    plt.show()


def create_confusion_matrix(nlp, examples):
    """
    Create confusion matrix for entity predictions
    """
    true_labels = []
    pred_labels = []

    for example in examples:
        text = example.reference.text
        pred_doc = nlp(text)

        # Get character-level predictions
        char_true = ['O'] * len(text)
        char_pred = ['O'] * len(text)

        # Mark true entities
        for ent in example.reference.ents:
            for i in range(ent.start_char, ent.end_char):
                char_true[i] = ent.label_

        # Mark predicted entities
        for ent in pred_doc.ents:
            for i in range(ent.start_char, ent.end_char):
                char_pred[i] = ent.label_

        true_labels.extend(char_true)
        pred_labels.extend(char_pred)

    # Get unique labels
    unique_labels = sorted(set(true_labels + pred_labels))

    # Create confusion matrix
    cm = confusion_matrix(true_labels, pred_labels, labels=unique_labels)

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', xticklabels=unique_labels,
                yticklabels=unique_labels, cmap='Blues')
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.show()

    return cm, unique_labels


def analyze_errors(nlp, examples):
    """
    Analyze prediction errors in detail
    """
    errors = {
        'false_positives': [],
        'false_negatives': [],
        'label_confusion': []
    }

    for example in examples:
        text = example.reference.text
        pred_doc = nlp(text)

        true_ents = set((ent.start_char, ent.end_char, ent.label_)
                        for ent in example.reference.ents)
        pred_ents = set((ent.start_char, ent.end_char, ent.label_)
                        for ent in pred_doc.ents)

        # False positives
        for start, end, label in pred_ents:
            if (start, end, label) not in true_ents:
                # Check if it's a boundary error or label confusion
                boundary_match = any((s, e, l) for s, e, l in true_ents
                                     if abs(s - start) <= 2 and abs(e - end) <= 2)
                if boundary_match:
                    errors['label_confusion'].append({
                        'text': text[start:end],
                        'predicted': label,
                        'context': text[max(0, start - 20):min(len(text), end + 20)]
                    })
                else:
                    errors['false_positives'].append({
                        'text': text[start:end],
                        'label': label,
                        'context': text[max(0, start - 20):min(len(text), end + 20)]
                    })

        # False negatives
        for start, end, label in true_ents:
            if (start, end, label) not in pred_ents:
                errors['false_negatives'].append({
                    'text': text[start:end],
                    'label': label,
                    'context': text[max(0, start - 20):min(len(text), end + 20)]
                })

    return errors


def train_ner_model(training_data, model_name=None, n_iter=30):
    """
    Train a custom NER model with performance tracking
    """
    # Split data
    train_data, val_data = split_data(training_data)
    print(f"Training samples: {len(train_data)}, Validation samples: {len(val_data)}")

    # Create blank model or load existing one
    if model_name:
        nlp = spacy.load(model_name)
    else:
        nlp = spacy.blank("en")

    # Add NER pipe if it doesn't exist
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner")
    else:
        ner = nlp.get_pipe("ner")

    # Add labels to NER
    labels = set()
    for _, annotations in train_data:
        for start, end, label in annotations["entities"]:
            labels.add(label)
            ner.add_label(label)

    print(f"Training with labels: {labels}")

    # Convert to Example objects
    train_examples = create_training_examples(nlp, train_data)
    val_examples = create_training_examples(nlp, val_data)

    # Training loop with validation tracking
    nlp.begin_training()
    losses_history = []
    val_scores_history = []

    for i in range(n_iter):
        random.shuffle(train_examples)
        losses = {}

        # Update model with examples
        nlp.update(train_examples, losses=losses, drop=0.5)

        # Track losses
        losses_history.append(losses.get('ner', 0))

        # Validation every 10 iterations
        if i % 10 == 0:
            val_scores = evaluate_model(nlp, val_examples)
            val_scores_history.append(val_scores)

            print(f"Iteration {i}")
            print(f"  Training Loss: {losses.get('ner', 0):.4f}")
            print(f"  Validation F1: {val_scores['ents_f']:.4f}")
            print(f"  Validation Precision: {val_scores['ents_p']:.4f}")
            print(f"  Validation Recall: {val_scores['ents_r']:.4f}")
            print("-" * 50)

    return nlp, losses_history, val_scores_history, val_examples


def save_training_data_to_docbin(training_data, output_path):
    """
    Save training data in spaCy's DocBin format (recommended for larger datasets)
    """
    nlp = spacy.blank("en")
    doc_bin = DocBin()

    for text, annotations in training_data:
        doc = nlp.make_doc(text)
        ents = []

        for start, end, label in annotations["entities"]:
            span = doc.char_span(start, end, label=label, alignment_mode="contract")
            if span:
                ents.append(span)

        doc.ents = ents
        doc_bin.add(doc)

    doc_bin.to_disk(output_path)
    print(f"Training data saved to {output_path}")


def main():
    """
    Main function with comprehensive analysis
    """
    # Load your labeled data
    with open("./data/latest.json", "r") as f:
        labeled_data = json.load(f)

    # Convert to spaCy format
    training_data = convert_to_spacy_format(labeled_data)
    print(f"Total training samples: {len(training_data)}")

    # Analyze data distribution
    print("\n=== DATA ANALYSIS ===")
    label_counts = plot_entity_distribution(training_data)
    print("Entity distribution:", dict(label_counts))

    # Train the model
    print("\n=== TRAINING ===")
    nlp, losses_history, val_scores_history, val_examples = train_ner_model(
        training_data, n_iter=350
    )

    # Plot training progress
    print("\n=== TRAINING ANALYSIS ===")
    plot_training_progress(losses_history)

    # Final evaluation
    print("\n=== FINAL EVALUATION ===")
    final_scores = evaluate_model(nlp, val_examples)
    print("Final Validation Scores:")
    for key, value in final_scores.items():
        if key.startswith('ents_'):
            print(f"  {key}: {value}")

    # Entity-level metrics
    entity_metrics = get_entity_level_metrics(nlp, val_examples)
    print("\nPer-entity metrics:")
    for label, metrics in entity_metrics.items():
        print(f"  {label}:")
        print(f"    Precision: {metrics['precision']:.4f}")
        print(f"    Recall: {metrics['recall']:.4f}")
        print(f"    F1: {metrics['f1']:.4f}")
        print(f"    Support: {metrics['support']}")

    # Plot performance metrics
    plot_performance_metrics(entity_metrics)

    # Create confusion matrix
    print("\n=== CONFUSION MATRIX ===")
    cm, labels = create_confusion_matrix(nlp, val_examples)

    # Error analysis
    print("\n=== ERROR ANALYSIS ===")
    errors = analyze_errors(nlp, val_examples)

    print(f"False Positives: {len(errors['false_positives'])}")
    if errors['false_positives']:
        print("Sample false positives:")
        for error in errors['false_positives'][:5]:
            print(f"  '{error['text']}' [{error['label']}] in: {error['context']}")

    print(f"\nFalse Negatives: {len(errors['false_negatives'])}")
    if errors['false_negatives']:
        print("Sample false negatives:")
        for error in errors['false_negatives'][:5]:
            print(f"  '{error['text']}' [{error['label']}] in: {error['context']}")

    # Test the model
    print("\n=== MODEL TESTING ===")
    test_texts = [
        "Generate a spur gear with 13 teeth, 1.0 module and 5 mm width",
        "Create a helical gear with 20 teeth and 2.5 module",
        "Make a gear with diameter 50mm and 15 teeth"
    ]

    for test_text in test_texts:
        doc = nlp(test_text)
        print(f"\nTest: '{test_text}'")
        if doc.ents:
            for ent in doc.ents:
                print(f"  {ent.text}: {ent.label_} (confidence: {ent._.score if hasattr(ent._, 'score') else 'N/A'})")
        else:
            print("  No entities found")

    # Save the model
    nlp.to_disk("./ner_model")
    print("\nModel saved to ./ner_model")


if __name__ == "__main__":
    main()